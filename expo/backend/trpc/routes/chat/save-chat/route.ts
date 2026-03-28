import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const saveChatProcedure = publicProcedure
  .input(z.object({
    message: z.string(),
    response: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Get user ID from auth header
    const authHeader = ctx.req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const userId = authHeader.replace('Bearer ', '');

    try {
      const { data, error } = await ctx.supabase
        .from('chats')
        .insert({
          user_id: userId,
          message: input.message,
          response: input.response,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Failed to save chat: ${error.message}` };
      }

      return { success: true, chat: data };
    } catch (error) {
      return { success: false, error: `Failed to save chat: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });