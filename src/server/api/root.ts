import { postRouter } from "~/server/api/routers/post";
import { subscriptionRouter } from "~/server/api/routers/subscription";
import { transactionRouter } from "~/server/api/routers/transaction";
import { guideRouter } from "~/server/api/routers/guide";
import { settingsRouter } from "~/server/api/routers/settings";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  subscription: subscriptionRouter,
  transaction: transactionRouter,
  guide: guideRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
