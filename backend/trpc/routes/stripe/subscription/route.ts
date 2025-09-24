import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getSubscriptionProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const { userId } = input;
    
    try {
      const { data, error } = await ctx.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        throw new Error(`Failed to fetch subscription: ${error.message}`);
      }
      
      return { subscription: data };
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const cancelSubscriptionProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { userId } = input;
    
    try {
      // Get the user's active subscription
      const { data: subscription, error: fetchError } = await ctx.supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (fetchError || !subscription) {
        throw new Error('No active subscription found');
      }
      
      // Cancel the subscription via Stripe API
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api';
      
      const response = await fetch(`${apiUrl}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: subscription.stripe_subscription_id,
          userId 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
      
      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });