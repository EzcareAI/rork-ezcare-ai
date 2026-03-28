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
  console.error('Failed to initialize Stripe in checkout route:', error);
}

export const createCheckoutSessionProcedure = publicProcedure
  .input(z.object({
    plan: z.enum(['starter', 'pro', 'premium']),
    userId: z.string(),
    email: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    const { plan, userId, email } = input;
    
    try {
      console.log('🚀 Creating checkout session for:', { plan, userId, email });
      
      // Check if Stripe is configured
      if (!stripe) {
        console.error('Stripe not initialized');
        throw new Error('Payment system not configured');
      }
      
      // Get price ID from environment
      const priceIds = {
        starter: process.env.STRIPE_PRICE_STARTER,
        pro: process.env.STRIPE_PRICE_PRO,
        premium: process.env.STRIPE_PRICE_PREMIUM,
      };

      const priceId = priceIds[plan];
      console.log('Price ID for plan', plan, ':', priceId);
      
      if (!priceId) {
        throw new Error(`Invalid plan: ${plan}`);
      }

      // Create or get customer
      let customer;
      console.log('Looking for existing customer with email:', email);
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('Found existing customer:', customer.id);
      } else {
        console.log('Creating new customer');
        customer = await stripe.customers.create({
          email,
          metadata: { userId }
        });
        console.log('Created new customer:', customer.id);
      }

      // Create checkout session
      console.log('Creating checkout session');
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_DOMAIN || 'exp://192.168.1.100:8081'}/dashboard?success=true`,
        cancel_url: `${process.env.FRONTEND_DOMAIN || 'exp://192.168.1.100:8081'}/pricing?canceled=true`,
        metadata: {
          userId,
          plan,
        },
      });

      console.log('Checkout session created:', session.id);
      return { success: true, url: session.url };
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Checkout failed: ${errorMessage}`);
    }
  });