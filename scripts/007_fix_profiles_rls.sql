-- Fix Row Level Security on profiles table
-- This script disables RLS and removes all policies to allow the application
-- to create and manage profiles without authentication issues

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for all users" ON profiles;

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
