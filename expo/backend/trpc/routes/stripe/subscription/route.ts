import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import Stripe from 'stripe';

// Initialize Stripe
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Stripe in subscription route:', error);
}

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
      console.log('🚀 Canceling subscription for user:', userId);
      
      // Check if Stripe is configured
      if (!stripe) {
        console.error('Stripe not initialized');
        throw new Error('Payment system not configured');
      }
      
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
      
      console.log('Found subscription to cancel:', subscription.stripe_subscription_id);
      
      // Cancel the subscription in Stripe
      const canceledSubscription = await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      console.log('Subscription canceled in Stripe:', canceledSubscription.id);

      // Update the subscription status in database
      await ctx.supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.stripe_subscription_id);

      // Downgrade user to free plan
      await ctx.supabase
        .from('users')
        .update({ 
          subscription_plan: 'trial',
          credits: 20,
          credits_reset_date: new Date().toISOString()
        })
        .eq('id', userId);

      console.log('Subscription canceled successfully');
      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to cancel subscription: ${errorMessage}`);
    }
  });