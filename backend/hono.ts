import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext, supabaseAdmin } from "./trpc/create-context";
import Stripe from 'stripe';

const app = new Hono();

// Initialize Stripe with error handling
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialized successfully');
  } else {
    console.warn('STRIPE_SECRET_KEY not found, Stripe features will be disabled');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

// Enable CORS with proper configuration
app.use("*", cors({
  origin: (origin, c) => {
    if (!origin || !origin.trim()) {
      console.log('CORS: No origin provided, allowing');
      return '*';
    }
    console.log('CORS origin check:', origin);
    // Allow all origins for now to fix connectivity issues
    return origin;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-trpc-source', 'Accept', 'Origin', 'X-Requested-With'],
  exposeHeaders: ['Content-Type', 'Authorization'],
}));

// Add request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  console.log(`🔍 ${c.req.method} ${c.req.url}`);
  await next();
  const end = Date.now();
  console.log(`✅ ${c.req.method} ${c.req.url} - ${c.res.status} (${end - start}ms)`);
});

// Health check
app.get("/", (c) => {
  console.log('Health check endpoint hit');
  return c.json({ 
    status: "ok", 
    message: "EZCare AI backend is running ✅",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Simple test route
app.get("/hello", (c) => c.json({ message: "Hello from minimal backend 🎉" }));

// Environment test route
app.get("/env-test", (c) => {
  return c.json({
    hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Stripe checkout endpoint
app.post("/checkout", async (c) => {
  try {
    console.log('🚀 Checkout endpoint hit!');
    console.log('Request method:', c.req.method);
    console.log('Request URL:', c.req.url);
    
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe not initialized');
      return c.json({ success: false, error: 'Payment system not configured' }, 500);
    }
    
    const { plan, userId, email } = await c.req.json();
    console.log('Checkout request:', { plan, userId, email });
    
    if (!plan || !userId || !email) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Get price ID from environment
    const priceIds = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      premium: process.env.STRIPE_PRICE_PREMIUM,
    };

    const priceId = priceIds[plan as keyof typeof priceIds];
    console.log('Price ID for plan', plan, ':', priceId);
    
    if (!priceId) {
      return c.json({ success: false, error: `Invalid plan: ${plan}` }, 400);
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
      success_url: `${process.env.FRONTEND_DOMAIN}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_DOMAIN}/pricing?canceled=true`,
      metadata: {
        userId,
        plan,
      },
    });

    console.log('Checkout session created:', session.id);
    return c.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: `Checkout failed: ${errorMessage}` }, 500);
  }
});

// Cancel subscription endpoint
app.post("/cancel-subscription", async (c) => {
  try {
    console.log('🚀 Cancel subscription endpoint hit!');
    
    if (!stripe) {
      console.error('Stripe not initialized');
      return c.json({ success: false, error: 'Payment system not configured' }, 500);
    }
    
    const { subscriptionId, userId } = await c.req.json();
    console.log('Cancel subscription request:', { subscriptionId, userId });
    
    if (!subscriptionId || !userId) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    console.log('Subscription canceled in Stripe:', canceledSubscription.id);

    // Update the subscription status in database
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscriptionId);

    // Downgrade user to free plan
    await supabaseAdmin
      .from('users')
      .update({ 
        subscription_plan: 'trial',
        credits: 20,
        credits_reset_date: new Date().toISOString()
      })
      .eq('id', userId);

    console.log('Subscription canceled successfully');
    return c.json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: `Cancel failed: ${errorMessage}` }, 500);
  }
});

// Stripe webhook endpoint
app.post("/stripe/webhook", async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();

  if (!sig) {
    return c.json({ error: 'No signature' }, 400);
  }

  if (!stripe) {
    return c.json({ error: 'Stripe not configured' }, 500);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata!;
        
        // Update user subscription and credits
        const credits = {
          starter: 50,
          pro: 200,
          premium: 999999
        }[plan as 'starter' | 'pro' | 'premium'] || 50;

        await supabaseAdmin
          .from('users')
          .update({ 
            subscription_plan: plan,
            credits,
            credits_reset_date: new Date().toISOString()
          })
          .eq('id', userId);

        // Create subscription record
        if (session.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan: plan as 'starter' | 'pro' | 'premium',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID
        const { data: subscriptionRecord } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, plan')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subscriptionRecord) {
          // Update subscription status
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status as 'active' | 'canceled' | 'past_due' | 'unpaid',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          // Reset credits if subscription renewed
          if (subscription.status === 'active') {
            const credits = {
              starter: 50,
              pro: 200,
              premium: 999999
            }[subscriptionRecord.plan as 'starter' | 'pro' | 'premium'] || 50;

            await supabaseAdmin
              .from('users')
              .update({ 
                credits,
                credits_reset_date: new Date().toISOString()
              })
              .eq('id', subscriptionRecord.user_id);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user and downgrade to free
        const { data: subscriptionRecord } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subscriptionRecord) {
          await supabaseAdmin
            .from('users')
            .update({ 
              subscription_plan: 'trial',
              credits: 20,
              credits_reset_date: new Date().toISOString()
            })
            .eq('id', subscriptionRecord.user_id);

          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Mount tRPC with debugging
app.use(
  "/trpc/*",
  async (c, next) => {
    console.log('🔍 tRPC request:', c.req.method, c.req.url);
    console.log('🔍 tRPC request headers:', Object.fromEntries(c.req.raw.headers.entries()));
    
    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      console.log('🔍 Handling CORS preflight for tRPC');
      return c.json({ ok: true }, 200);
    }
    
    await next();
    console.log('🔍 tRPC response status:', c.res.status);
  },
  trpcServer({
    router: appRouter,
    createContext,
    onError: ({ error, path, type }) => {
      console.error('🚨 tRPC Error:', {
        path,
        type,
        error: error.message,
        stack: error.stack,
        cause: error.cause
      });
    },
  })
);

// Catch-all route for debugging
app.all('*', (c) => {
  console.log('🔍 Catch-all route hit:', c.req.method, c.req.url);
  console.log('🔍 Request headers:', Object.fromEntries(c.req.raw.headers.entries()));
  console.log('Available routes: /, /hello, /env-test, /checkout, /cancel-subscription, /stripe/webhook, /trpc/*');
  
  // Handle OPTIONS requests for any route
  if (c.req.method === 'OPTIONS') {
    console.log('🔍 Handling CORS preflight for catch-all');
    return c.json({ ok: true }, 200);
  }
  
  return c.json({ 
    error: 'Route not found', 
    method: c.req.method, 
    url: c.req.url,
    timestamp: new Date().toISOString(),
    availableRoutes: ['/', '/hello', '/env-test', '/checkout', '/cancel-subscription', '/stripe/webhook', '/trpc/*'],
    headers: Object.fromEntries(c.req.raw.headers.entries())
  }, 404);
});

export default app;