import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const getQuizHistoryProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    if (!input.userId) {
      return [];
    }

    const { data, error } = await ctx.supabase
      .from('quiz_responses')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Quiz history error:', error);
      // If table doesn't exist or other DB error, return empty array instead of throwing
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Quiz responses table not found, returning empty array');
        return [];
      }
      throw new Error(`Failed to get quiz history: ${error.message}`);
    }

    return data || [];
  });