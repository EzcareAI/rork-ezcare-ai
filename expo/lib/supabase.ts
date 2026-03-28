import { createClient } from '@supabase/supabase-js';

// Environment variable validation
function validateEnvVars() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase env validation:', {
    url: supabaseUrl ? 'DEFINED' : 'UNDEFINED',
    key: supabaseAnonKey ? 'DEFINED' : 'UNDEFINED',
    env: __DEV__ ? 'development' : 'production',
    mode: 'PRODUCTION'
  });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = `Missing Supabase environment variables. Please check your .env.local file. URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`;
    console.error(error);
    throw new Error(error);
  }
  
  return { supabaseUrl, supabaseAnonKey };
}

const { supabaseUrl, supabaseAnonKey } = validateEnvVars();



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our database tables
export interface User {
  id: string;
  email: string;
  name?: string;
  credits: number;
  subscription_plan: 'trial' | 'starter' | 'pro' | 'premium';
  referral_code?: string;
  credits_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  country_code: string;
  height: number;
  weight: number;
  sleep_hours: number;
  activity_level: string;
  smoking: boolean;
  alcohol_frequency: string;
  stress_level: number;
  diet_quality: string;
  bmi: number;
  bmi_category: string;
  health_score: number;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: 'trial' | 'starter' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}