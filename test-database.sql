-- Test script to verify tables exist
-- Run this in Supabase SQL Editor after running the main script

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'quiz_responses', 'chats', 'subscriptions');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'quiz_responses', 'chats', 'subscriptions');

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test inserting a sample user (this will fail if table doesn't exist)
-- Don't worry if this fails due to auth constraints, we just want to test table existence
-- INSERT INTO public.users (id, email) VALUES ('test-id', 'test@example.com');