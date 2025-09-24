import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const createCheckoutSessionProcedure = publicProcedure
  .input(z.object({
    plan: z.enum(['starter', 'pro', 'premium']),
    userId: z.string(),
    email: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    const { plan, userId, email } = input;
    
    try {
      // Use the correct API URL from environment
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api';
      
      const response = await fetch(`${apiUrl}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId, email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      return data;
    } catch (error) {
      throw new Error(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });