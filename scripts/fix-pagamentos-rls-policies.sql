-- Fix RLS policies for pagamentos table
-- This script drops all existing policies and creates new ones that allow authenticated users

-- Drop all existing policies on pagamentos table
DROP POLICY IF EXISTS "Admin and operators can view all payments" ON public.pagamentos;
DROP POLICY IF EXISTS "Admin and operators can manage payments" ON public.pagamentos;
DROP POLICY IF EXISTS "pagamentos_all_authenticated" ON public.pagamentos;

-- Create new policy that allows all authenticated users to manage payments
CREATE POLICY "authenticated_users_manage_pagamentos" 
ON public.pagamentos 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'pagamentos';
