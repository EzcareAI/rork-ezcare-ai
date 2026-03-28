import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const getChatHistoryProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const { data, error } = await ctx.supabase
      .from('chats')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get chat history: ${error.message}`);
    }

    return data;
  });