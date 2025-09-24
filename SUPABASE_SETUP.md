# Supabase Integration Setup

This project now uses Supabase for authentication and database operations.

## Environment Variables Required

Add these to your environment:

```bash
# Frontend (Expo)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_base_url

# Backend (Hono)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

**🚨 CRITICAL: You must complete this step to fix the "table not found" error! 🚨**

**The error "Could not find the table 'public.users' in the schema cache PGRST205" means you haven't run the SQL schema yet!**

### Step-by-Step Instructions:

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Select your project**: lphwyfiaozpozpupizok
3. **Click "SQL Editor"** in the left sidebar
4. **Click "New Query"** (the + button)
5. **Copy the ENTIRE contents** of `supabase-schema.sql` (all 142 lines)
6. **Paste it into the SQL editor**
7. **Click "Run"** to execute the schema
8. **You should see "Success. No rows returned"**
9. **Go to "Table Editor"** to verify these tables were created:
   - ✅ `users` table (extends auth.users)
   - ✅ `quiz_responses` table
   - ✅ `chats` table  
   - ✅ `subscriptions` table
   - ✅ Row Level Security policies
   - ✅ Automatic user profile creation trigger

### Troubleshooting:
- If you see the tables in "Schema Visualizer" but NOT in "Table Editor", the schema wasn't executed properly
- Make sure you run the ENTIRE schema file, not just parts of it
- The trigger should automatically create user profiles when someone signs up
- Service role policies allow the backend to create users if the trigger fails

## Features Implemented

### Authentication
- ✅ Supabase Auth integration
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Automatic user profile creation
- ✅ Session management
- ✅ Logout functionality

### Database
- ✅ User profiles with credits and subscription plans
- ✅ Quiz responses storage
- ✅ Chat history storage
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamps and triggers

### API Routes
- ✅ `/api/create-user` - Creates user profile after signup
- ✅ Backend tRPC integration with Supabase
- ✅ Service role key for protected operations

## Usage

The auth context now uses real Supabase authentication:

```typescript
import { useAuth } from '@/contexts/auth-context';

const { user, session, login, signup, logout } = useAuth();

// Sign up
await signup('user@example.com', 'password123');

// Sign in  
await login('user@example.com', 'password123');

// Access user data
console.log(user?.email, user?.credits, user?.subscription_plan);
```

## Database Tables

### users
- Extends Supabase auth.users
- Stores credits, subscription_plan, referral_code
- Automatically created when user signs up

### quiz_responses
- Stores health quiz responses
- Links to user via user_id
- Includes BMI calculation and health score

### chats
- Stores AI chat conversations
- Links to user via user_id
- Message and response pairs

### subscriptions
- Stripe subscription management
- Links to user via user_id
- Tracks subscription status and periods