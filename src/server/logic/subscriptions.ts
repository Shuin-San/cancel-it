import { db } from "~/server/db";
import {
  transactions,
  subscriptions,
  merchants,
  subscriptionGuides,
} from "~/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { addMonths, addWeeks, addYears, differenceInDays } from "date-fns";

function normalizeMerchantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

interface TransactionGroup {
  merchantId: string;
  normalized: string;
  amounts: number[];
  dates: Date[];
  currency: string;
  firstDate: Date;
  lastDate: Date;
}

function groupByMerchant(
  txs: Array<{
    merchantId: string | null;
    normalizedMerchant: string | null;
    amount: string;
    date: Date;
    currency: string;
  }>,
): TransactionGroup[] {
  const groups = new Map<string, TransactionGroup>();

  for (const tx of txs) {
    if (!tx.merchantId || !tx.normalizedMerchant) continue;

    const key = tx.merchantId;
    if (!groups.has(key)) {
      groups.set(key, {
        merchantId: tx.merchantId,
        normalized: tx.normalizedMerchant,
        amounts: [],
        dates: [],
        currency: tx.currency,
        firstDate: tx.date,
        lastDate: tx.date,
      });
    }

    const group = groups.get(key)!;
    group.amounts.push(parseFloat(tx.amount));
    group.dates.push(tx.date);
    if (tx.date < group.firstDate) group.firstDate = tx.date;
    if (tx.date > group.lastDate) group.lastDate = tx.date;
  }

  return Array.from(groups.values());
}

function isRecurring(group: TransactionGroup): boolean {
  if (group.dates.length < 2) return false;

  // Sort dates
  const sortedDates = [...group.dates].sort((a, b) => a.getTime() - b.getTime());

  // Check for consistent intervals
  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const days = differenceInDays(sortedDates[i], sortedDates[i - 1]);
    intervals.push(days);
  }

  // Check if intervals are roughly consistent (within 5 days variance)
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const hasConsistentIntervals = intervals.every(
    (interval) => Math.abs(interval - avgInterval) <= 5,
  );

  // Must have at least 2 transactions and consistent intervals
  return group.dates.length >= 2 && hasConsistentIntervals;
}

function estimateNext(
  group: TransactionGroup,
  interval: "monthly" | "quarterly" | "annual" | "weekly",
): Date {
  const lastDate = group.lastDate;
  switch (interval) {
    case "weekly":
      return addWeeks(lastDate, 1);
    case "monthly":
      return addMonths(lastDate, 1);
    case "quarterly":
      return addMonths(lastDate, 3);
    case "annual":
      return addYears(lastDate, 1);
    default:
      return addMonths(lastDate, 1);
  }
}

function detectInterval(group: TransactionGroup): "monthly" | "quarterly" | "annual" | "weekly" {
  if (group.dates.length < 2) return "monthly";

  const sortedDates = [...group.dates].sort((a, b) => a.getTime() - b.getTime());
  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const days = differenceInDays(sortedDates[i], sortedDates[i - 1]);
    intervals.push(days);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  if (avgInterval <= 10) return "weekly";
  if (avgInterval <= 35) return "monthly";
  if (avgInterval <= 100) return "quarterly";
  return "annual";
}

export async function detectSubscriptionsForUser(userId: string) {
  const txs = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    columns: {
      merchantId: true,
      normalizedMerchant: true,
      amount: true,
      date: true,
      currency: true,
    },
  });

  const groups = groupByMerchant(txs);

  for (const group of groups) {
    if (!isRecurring(group)) continue;

    const interval = detectInterval(group);
    const avgAmount =
      group.amounts.reduce((a, b) => a + b, 0) / group.amounts.length;
    const nextExpected = estimateNext(group, interval);

    // Try to match guide by normalized merchant name
    const normalizedForMatch = group.normalized;
    const guide = await db.query.subscriptionGuides.findFirst({
      where: sql`LOWER(${subscriptionGuides.providerSlug}) = LOWER(${normalizedForMatch})`,
    });

    // Check if subscription already exists
    const existing = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.merchantId, group.merchantId),
      ),
    });

    if (existing) {
      // Update existing subscription (only if not manually created)
      if (!existing.fromManual) {
        await db
          .update(subscriptions)
          .set({
            averageAmount: avgAmount.toString(),
            lastSeen: group.lastDate,
            nextExpectedDate: nextExpected,
            billingInterval: interval,
            guideId: guide?.id ?? existing.guideId,
          })
          .where(eq(subscriptions.id, existing.id));
      }
    } else {
      // Create new subscription
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        userId,
        merchantId: group.merchantId,
        averageAmount: avgAmount.toString(),
        currency: group.currency,
        billingInterval: interval,
        firstSeen: group.firstDate,
        lastSeen: group.lastDate,
        nextExpectedDate: nextExpected,
        fromManual: false,
        guideId: guide?.id,
        status: "ACTIVE",
      });
    }
  }
}

