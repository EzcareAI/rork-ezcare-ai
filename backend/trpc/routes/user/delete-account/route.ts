import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const deleteUserDataProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Delete in order due to foreign key constraints
      
      // Delete chats
      const { error: chatsError } = await ctx.supabase
        .from('chats')
        .delete()
        .eq('user_id', input.userId);

      if (chatsError) {
        return { success: false, error: `Failed to delete chats: ${chatsError.message}` };
      }

      // Delete quiz responses
      const { error: quizError } = await ctx.supabase
        .from('quiz_responses')
        .delete()
        .eq('user_id', input.userId);

      if (quizError) {
        return { success: false, error: `Failed to delete quiz responses: ${quizError.message}` };
      }

      // Delete subscriptions
      const { error: subscriptionsError } = await ctx.supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', input.userId);

      if (subscriptionsError) {
        return { success: false, error: `Failed to delete subscriptions: ${subscriptionsError.message}` };
      }

      // Delete user profile
      const { error: userError } = await ctx.supabase
        .from('users')
        .delete()
        .eq('id', input.userId);

      if (userError) {
        return { success: false, error: `Failed to delete user: ${userError.message}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });