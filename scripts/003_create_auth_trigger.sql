-- Create trigger to automatically create profile when user signs up
-- This ensures every authenticated user has a profile record

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', 'Usuário'),
    new.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
