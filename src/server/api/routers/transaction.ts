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

        // Parse bank statement
        const parsedTransactions = parseBankStatement(extractedText, {
          currency: input.currency,
        });

        if (parsedTransactions.length === 0) {
          throw new Error(
            "No transactions could be extracted from the bank statement",
          );
        }

        // Process and save transactions
        const transactionData = [];

        for (const parsedTx of parsedTransactions) {
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

          transactionData.push({
            id: crypto.randomUUID(),
            userId,
            date: parsedTx.date,
            amount: Math.abs(parsedTx.amount).toString(), // Store absolute value
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

