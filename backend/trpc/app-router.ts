import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { saveQuizResponseProcedure } from "./routes/quiz/save-response/route";
import { getQuizHistoryProcedure } from "./routes/quiz/get-history/route";
import { saveChatProcedure } from "./routes/chat/save-chat/route";
import { getChatHistoryProcedure } from "./routes/chat/get-history/route";
import { deleteUserDataProcedure } from "./routes/user/delete-account/route";
import { createUserProcedure, getUserProcedure } from "./routes/user/create-user/route";
import { testDatabaseProcedure } from "./routes/test/database/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
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
  }),
  test: createTRPCRouter({
    database: testDatabaseProcedure,
  }),
});

export type AppRouter = typeof appRouter;