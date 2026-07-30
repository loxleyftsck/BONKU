-- BONKU — Fix profile creation
--
-- Problem: public.profiles has RLS enabled with only SELECT and UPDATE policies.
-- The registration API inserted profiles with the anon client, so RLS denied
-- every insert. Because transactions.user_id is a NOT NULL FK to profiles(id),
-- every account was left permanently unable to create a transaction.
--
-- Fix: create the profile from a SECURITY DEFINER trigger on auth.users, which
-- bypasses RLS by design. The API route no longer inserts profiles at all.

-- =====================================================
-- 1. Trigger: create a profile for every new auth user
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. INSERT policy on profiles (defense in depth)
-- =====================================================
-- The trigger above is the real mechanism; this policy means a legitimate
-- authenticated client-side insert of one's OWN profile is not silently denied.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. Backfill profiles for any users stranded by the bug
-- =====================================================
INSERT INTO public.profiles (id, email, name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
  AND u.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
