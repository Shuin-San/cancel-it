import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { transactions, merchants } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import Papa from "papaparse";
import { extractTextFromPdf } from "~/server/services/vision";
import {
  parseBankStatement,
  normalizeMerchantName as normalizeMerchantNameFromParser,
} from "~/server/services/bank-statement-parser";

function normalizeMerchantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export const transactionRouter = createTRPCRouter({
  importCsv: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return new Promise((resolve, reject) => {
        Papa.parse(input.csvContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            void (async () => {
              try {
              const rows = results.data as Array<{
                date?: string;
                amount?: string;
                description?: string;
                merchant?: string;
                [key: string]: unknown;
              }>;

              const transactionData = [];

              for (const row of rows) {
                if (!row.date || !row.amount || !row.description) {
                  continue;
                }

                const date = new Date(row.date);
                const amount = parseFloat(
                  row.amount.replace(/[^0-9.-]/g, ""),
                );
                const description = row.description.trim();
                const normalizedMerchant = normalizeMerchantName(
                  row.merchant ?? description,
                );

                if (isNaN(amount) || isNaN(date.getTime())) {
                  continue;
                }

                // Find or create merchant
                let merchant = await ctx.db.query.merchants.findFirst({
                  where: eq(merchants.normalized, normalizedMerchant),
                });

                if (!merchant) {
                  const [newMerchant] = await ctx.db
                    .insert(merchants)
                    .values({
                      id: crypto.randomUUID(),
                      name: row.merchant ?? description,
                      normalized: normalizedMerchant,
                    })
                    .returning();
                  if (!newMerchant) {
                    throw new Error("Failed to create merchant");
                  }
                  merchant = newMerchant;
                }

                transactionData.push({
                  id: crypto.randomUUID(),
                  userId,
                  date,
                  amount: amount.toString(),
                  currency: "USD",
                  descriptionRaw: description,
                  normalizedMerchant,
                  merchantId: merchant.id,
                  isSubscriptionLike: false,
                });
              }

              if (transactionData.length > 0) {
                await ctx.db.insert(transactions).values(transactionData);
              }

                resolve({ count: transactionData.length });
              } catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
              }
            })();
          },
          error: (error: Error) => {
            reject(error instanceof Error ? error : new Error(String(error)));
          },
        });
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const results = await ctx.db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
        limit: input.limit + 1,
        orderBy: [desc(transactions.date)],
        with: {
          merchant: true,
        },
      });

      let nextCursor: string | undefined = undefined;
      if (results.length > input.limit) {
        const nextItem = results.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: results,
        nextCursor,
      };
    }),

  importPdf: protectedProcedure
    .input(
      z.object({
        pdfBase64: z.string(), // Base64 encoded PDF
        currency: z.string().default("USD"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(input.pdfBase64, "base64");

        // Extract text from PDF using Google Vision API
        const extractedText = await extractTextFromPdf(pdfBuffer);

        // Clear PDF buffer from memory immediately
        pdfBuffer.fill(0);

        // Log extracted text for debugging (first 1000 chars)
        console.log("Extracted text sample (first 1000 chars):", extractedText.substring(0, 1000));
        console.log("Extracted text length:", extractedText.length);

        // Parse bank statement
        const parsedTransactions = parseBankStatement(extractedText, {
          currency: input.currency,
        });

        console.log(`Parsed ${parsedTransactions.length} transaction(s) from bank statement`);

        if (parsedTransactions.length === 0) {
          // Log more details about why parsing failed
          console.error("No transactions found. Extracted text:", extractedText.substring(0, 2000));
          throw new Error(
            "No transactions could be extracted from the bank statement. Please check that the PDF contains a valid bank statement with dates and amounts.",
          );
        }

        // Known subscription providers - normalized names for matching
        const knownSubscriptionProviders = [
          "spotify",
          "netflix",
          "disney",
          "disneyplus",
          "disney plus",
          "hbo",
          "hbomax",
          "hbo max",
          "amazon prime",
          "prime video",
          "apple",
          "applemusic",
          "apple music",
          "appletv",
          "apple tv",
          "youtube",
          "youtube premium",
          "youtubetv",
          "youtube tv",
          "paramount",
          "paramount plus",
          "paramountplus",
          "peacock",
          "nbc peacock",
          "hulu",
          "showtime",
          "starz",
          "crunchyroll",
          "funimation",
          "amc",
          "amc plus",
          "amcplus",
          "shudder",
          "mubi",
          "criterion",
          "dropbox",
          "onedrive",
          "icloud",
          "google drive",
          "google one",
          "adobe",
          "adobe creative cloud",
          "creative cloud",
          "microsoft",
          "microsoft 365",
          "office 365",
          "github",
          "github copilot",
          "notion",
          "evernote",
          "lastpass",
          "1password",
          "dashlane",
          "grammarly",
          "linkedin",
          "linkedin premium",
          "medium",
          "medium membership",
          "substack",
          "patreon",
          "onlyfans",
          "twitch",
          "twitch turbo",
          "discord",
          "discord nitro",
          "slack",
          "zoom",
          "webex",
          "canva",
          "canva pro",
          "figma",
          "adobe xd",
          "sketch",
          "linear",
          "asana",
          "trello",
          "monday",
          "clickup",
          "todoist",
          "roam research",
          "obsidian",
          "bear",
          "ulysses",
          "scrivener",
          "setapp",
          "cleanmymac",
          "parallels",
          "vmware",
          "norton",
          "mcafee",
          "kaspersky",
          "bitdefender",
          "expressvpn",
          "nordvpn",
          "surfshark",
          "protonvpn",
          "private internet access",
          "pia",
          "audible",
          "kindle unlimited",
          "scribd",
          "blinkist",
          "masterclass",
          "skillshare",
          "udemy",
          "coursera",
          "pluralsight",
          "codecademy",
          "treehouse",
          "lynda",
          "linkedin learning",
          "duolingo",
          "babbel",
          "rosetta stone",
          "headspace",
          "calm",
          "betterhelp",
          "talkspace",
          "noom",
          "weight watchers",
          "ww",
          "myfitnesspal",
          "strava",
          "peloton",
          "nike training club",
          "nike run club",
          "fitbit",
          "whoop",
          "oura",
          "calm",
          "headspace",
          "spotify",
          "apple music",
          "tidal",
          "pandora",
          "siriusxm",
          "sirius xm",
          "iheartradio",
          "soundcloud",
          "bandcamp",
          "deezer",
          "qobuz",
        ];

        // Filter transactions to only include known subscription providers
        const subscriptionTransactions = parsedTransactions.filter((tx) => {
          const merchantName = (tx.merchant ?? tx.description).toLowerCase();
          const normalizedMerchant = normalizeMerchantNameFromParser(
            tx.merchant ?? tx.description,
          );

          // Check if merchant matches any known subscription provider
          const isKnownProvider = knownSubscriptionProviders.some((provider) => {
            return (
              merchantName.includes(provider) ||
              normalizedMerchant.includes(provider) ||
              provider.includes(normalizedMerchant)
            );
          });

          // Also check if description contains subscription keywords
          const hasSubscriptionKeywords =
            tx.description.toLowerCase().includes("subscription") ||
            tx.description.toLowerCase().includes("premium") ||
            tx.description.toLowerCase().includes("membership") ||
            tx.description.toLowerCase().includes("recurring") ||
            tx.transactionType === "SUBSCRIPTION";

          return isKnownProvider || hasSubscriptionKeywords;
        });

        console.log(
          `Filtered to ${subscriptionTransactions.length} subscription transaction(s) from ${parsedTransactions.length} total transaction(s)`,
        );

        if (subscriptionTransactions.length === 0) {
          throw new Error(
            "No subscription transactions found. The bank statement does not contain transactions from known subscription providers.",
          );
        }

        // Process and save transactions
        const transactionData = [];

        for (const parsedTx of subscriptionTransactions) {
          // Normalize merchant name
          const normalizedMerchant = normalizeMerchantNameFromParser(
            parsedTx.merchant ?? parsedTx.description,
          );

          // Find or create merchant
          let merchant = await ctx.db.query.merchants.findFirst({
            where: eq(merchants.normalized, normalizedMerchant),
          });

          if (!merchant) {
            const [newMerchant] = await ctx.db
              .insert(merchants)
              .values({
                id: crypto.randomUUID(),
                name: parsedTx.merchant ?? parsedTx.description.substring(0, 255),
                normalized: normalizedMerchant,
              })
              .returning();
            if (!newMerchant) {
              throw new Error("Failed to create merchant");
            }
            merchant = newMerchant;
          }

          // Determine if transaction is subscription-like
          const isSubscriptionLike =
            parsedTx.transactionType === "SUBSCRIPTION" ||
            parsedTx.description.toLowerCase().includes("subscription") ||
            parsedTx.description.toLowerCase().includes("recurring");

          // Format amount for database (numeric precision 10, scale 2)
          // Round to 2 decimal places and ensure it's within precision limits
          const absAmount = Math.abs(parsedTx.amount);
          const roundedAmount = Math.round(absAmount * 100) / 100; // Round to 2 decimal places
          
          // Check if amount exceeds precision (max: 99,999,999.99)
          if (roundedAmount > 99999999.99) {
            console.warn(
              `Transaction amount ${roundedAmount} exceeds database precision limit. Skipping transaction.`,
            );
            continue;
          }

          // Format as decimal string with exactly 2 decimal places
          const amountString = roundedAmount.toFixed(2);

          transactionData.push({
            id: crypto.randomUUID(),
            userId,
            date: parsedTx.date,
            amount: amountString,
            currency: parsedTx.currency,
            descriptionRaw: parsedTx.description,
            normalizedMerchant,
            merchantId: merchant.id,
            isSubscriptionLike,
          });
        }

        // Insert all transactions
        if (transactionData.length > 0) {
          await ctx.db.insert(transactions).values(transactionData);
        }

        return { count: transactionData.length };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to import PDF: ${error.message}`);
        }
        throw new Error("Failed to import PDF: Unknown error");
      }
    }),
});

