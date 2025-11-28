import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userSettings } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// EU country codes
const EU_COUNTRIES = [
  "AT", // Austria
  "BE", // Belgium
  "BG", // Bulgaria
  "HR", // Croatia
  "CY", // Cyprus
  "CZ", // Czech Republic
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IE", // Ireland
  "IT", // Italy
  "LV", // Latvia
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "PL", // Poland
  "PT", // Portugal
  "RO", // Romania
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "SE", // Sweden
];

function getCurrencyForCountry(countryCode: string | null | undefined): string {
  if (!countryCode) return "USD";
  return EU_COUNTRIES.includes(countryCode.toUpperCase()) ? "EUR" : "USD";
}

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const settings = await ctx.db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    // Return default settings if none exist
    if (!settings) {
      return {
        country: null,
        currency: "USD",
        emailNotificationsEnabled: true,
        renewalRemindersEnabled: true,
      };
    }

    return {
      country: settings.country,
      currency: settings.currency,
      emailNotificationsEnabled: settings.emailNotificationsEnabled,
      renewalRemindersEnabled: settings.renewalRemindersEnabled,
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        country: z.string().length(2).optional().nullable(),
        currency: z.string().optional(),
        emailNotificationsEnabled: z.boolean().optional(),
        renewalRemindersEnabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Determine currency based on country if not explicitly provided
      let currency = input.currency;
      if (input.country !== undefined && !currency) {
        currency = getCurrencyForCountry(input.country);
      }

      // Check if settings exist
      const existing = await ctx.db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
      });

      if (existing) {
        // Update existing settings
        const [updated] = await ctx.db
          .update(userSettings)
          .set({
            country: input.country ?? existing.country,
            currency: currency ?? existing.currency,
            emailNotificationsEnabled:
              input.emailNotificationsEnabled ?? existing.emailNotificationsEnabled,
            renewalRemindersEnabled:
              input.renewalRemindersEnabled ?? existing.renewalRemindersEnabled,
            updatedAt: new Date(),
          })
          .where(eq(userSettings.userId, userId))
          .returning();

        return updated;
      } else {
        // Create new settings
        const [newSettings] = await ctx.db
          .insert(userSettings)
          .values({
            id: crypto.randomUUID(),
            userId,
            country: input.country ?? null,
            currency: currency ?? "USD",
            emailNotificationsEnabled: input.emailNotificationsEnabled ?? true,
            renewalRemindersEnabled: input.renewalRemindersEnabled ?? true,
          })
          .returning();

        if (!newSettings) {
          throw new Error("Failed to create settings");
        }

        return newSettings;
      }
    }),
});

