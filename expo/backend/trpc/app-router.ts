import { createTRPCRouter, publicProcedure } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import { saveQuizResponseProcedure } from "./routes/quiz/save-response/route";
import { getQuizHistoryProcedure } from "./routes/quiz/get-history/route";
import { saveChatProcedure } from "./routes/chat/save-chat/route";
import { getChatHistoryProcedure } from "./routes/chat/get-history/route";
import { deleteUserDataProcedure } from "./routes/user/delete-account/route";
import { createUserProcedure, getUserProcedure, updateUserSubscriptionProcedure } from "./routes/user/create-user/route";
import { testDatabaseProcedure } from "./routes/test/database/route";
import { createCheckoutSessionProcedure } from "./routes/stripe/checkout/route";
import { getSubscriptionProcedure, cancelSubscriptionProcedure } from "./routes/stripe/subscription/route";

export const appRouter = createTRPCRouter({
  debug: createTRPCRouter({
    ping: publicProcedure.query(() => ({ message: 'pong', timestamp: new Date().toISOString() })),
  }),
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  quiz: createTRPCRouter({
    saveResponse: saveQuizResponseProcedure,
    getHistory: getQuizHistoryProcedure,
  }),
  chat: createTRPCRouter({
    saveChat: saveChatProcedure,
    getHistory: getChatHistoryProcedure,
  }),
  user: createTRPCRouter({
    deleteAccount: deleteUserDataProcedure,
    createUser: createUserProcedure,
    getUser: getUserProcedure,
    updateSubscription: updateUserSubscriptionProcedure,
  }),
  stripe: createTRPCRouter({
    createCheckoutSession: createCheckoutSessionProcedure,
    getSubscription: getSubscriptionProcedure,
    cancelSubscription: cancelSubscriptionProcedure,
  }),
  test: createTRPCRouter({
    database: testDatabaseProcedure,
  }),
});

export type AppRouter = typeof appRouter;