import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  subscriptions,
  merchants,
  subscriptionGuides,
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { detectSubscriptionsForUser } from "~/server/logic/subscriptions";

function normalizeMerchantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export const subscriptionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const subs = await ctx.db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
      with: {
        merchant: true,
        guide: true,
      },
      orderBy: (subs, { asc }) => [asc(subs.nextExpectedDate)],
    });

    return subs;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const sub = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.id, input.id),
          eq(subscriptions.userId, userId),
        ),
        with: {
          merchant: true,
          guide: true,
        },
      });

      return sub ?? null;
    }),

  recalculate: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await detectSubscriptionsForUser(userId);
    return { success: true };
  }),

  createManual: protectedProcedure
    .input(
      z.object({
        merchantName: z.string().min(1),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        billingInterval: z.enum(["weekly", "monthly", "quarterly", "annual"]),
        guideId: z.string().optional(),
        nextExpectedDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Normalize merchant name
      const normalized = normalizeMerchantName(input.merchantName);

      // Find or create merchant
      let merchant = await ctx.db.query.merchants.findFirst({
        where: eq(merchants.normalized, normalized),
      });

      if (!merchant) {
        const [newMerchant] = await ctx.db
          .insert(merchants)
          .values({
            id: crypto.randomUUID(),
            name: input.merchantName,
            normalized,
          })
          .returning();
        merchant = newMerchant;
      }

      // Calculate next expected date if not provided
      let nextExpected = input.nextExpectedDate;
      if (!nextExpected) {
        const now = new Date();
        switch (input.billingInterval) {
          case "weekly":
            nextExpected = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case "monthly":
            nextExpected = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
          case "quarterly":
            nextExpected = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
            break;
          case "annual":
            nextExpected = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      // If guideId provided, verify it exists
      if (input.guideId) {
        const guide = await ctx.db.query.subscriptionGuides.findFirst({
          where: eq(subscriptionGuides.id, input.guideId),
        });
        if (!guide) {
          throw new Error("Guide not found");
        }
      }

      const [subscription] = await ctx.db
        .insert(subscriptions)
        .values({
          id: crypto.randomUUID(),
          userId,
          merchantId: merchant.id,
          averageAmount: input.amount.toString(),
          currency: input.currency,
          billingInterval: input.billingInterval,
          firstSeen: new Date(),
          lastSeen: new Date(),
          nextExpectedDate: nextExpected,
          fromManual: true,
          guideId: input.guideId,
          status: "ACTIVE",
        })
        .returning();

      return subscription;
    }),
});

