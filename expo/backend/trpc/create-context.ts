import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Backend environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  nodeEnv: process.env.NODE_ENV,
  allEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Missing Supabase environment variables for backend:', {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey,
    env: process.env.NODE_ENV
  });
  // Don't throw error, create a dummy client that will fail gracefully
}

// Backend Supabase client with service role key
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null; // Fallback to null if env vars are missing

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  console.log('🔍 Creating tRPC context');
  console.log('🔍 Supabase admin client available:', !!supabaseAdmin);
  
  if (!supabaseAdmin) {
    console.error('❌ Supabase admin client is null - check environment variables');
    console.error('❌ EXPO_PUBLIC_SUPABASE_URL:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  
  return {
    req: opts.req,
    supabase: supabaseAdmin,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Add auth middleware here if needed
  return next({ ctx });
});