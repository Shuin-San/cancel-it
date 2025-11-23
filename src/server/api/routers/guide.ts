import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { subscriptionGuides } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const guideRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const guides = await ctx.db.query.subscriptionGuides.findMany({
      orderBy: (guides, { asc }) => [asc(guides.providerName)],
    });
    return guides;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const guide = await ctx.db.query.subscriptionGuides.findFirst({
        where: eq(subscriptionGuides.providerSlug, input.slug),
      });
      return guide ?? null;
    }),
});

