-- BONKU — Support anonymous (guest) accounts
--
-- Prerequisite for a public live demo. Demo mode in the application is
-- hard-gated to non-production builds on purpose, so a deployed demo cannot
-- use it. The supported path is Supabase anonymous sign-in: a guest becomes a
-- real auth.users row subject to the same RLS as everyone else, rather than an
-- authentication bypass.
--
-- Two things block that today.
--
-- 1. Anonymous users have a NULL email, but public.profiles.email is NOT NULL
--    and the migration 003 trigger inserts NEW.email directly. The trigger
--    would raise, and because it is an AFTER INSERT trigger on auth.users the
--    whole signInAnonymously() call fails — reproducing exactly the bug that
--    migration 003 fixed for email users.
--
-- 2. profiles.id references auth.users(id) with no ON DELETE CASCADE, so
--    deleting an expired guest is blocked by the foreign key. Guest accounts
--    accumulate without a way to remove them.

-- =====================================================
-- 1. Allow profiles without an email
-- =====================================================
ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL;

-- Marks rows created by anonymous sign-in, so cleanup can target them without
-- guessing from a null email later.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_guest
  ON public.profiles(is_guest)
  WHERE is_guest = TRUE;

-- =====================================================
-- 2. Deleting an auth user removes its profile
-- =====================================================
-- transactions.user_id already cascades from profiles, so this completes the
-- chain: delete the auth user, and the profile and its transactions follow.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- 3. Trigger handles both email and anonymous users
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Guest status is derived from the absence of an email rather than from
  -- auth.users.is_anonymous, so this works on Supabase versions that predate
  -- that column.
  v_is_guest BOOLEAN := NEW.email IS NULL;
BEGIN
  INSERT INTO public.profiles (id, email, name, is_guest)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      CASE
        WHEN NEW.email IS NULL THEN 'Tamu'
        ELSE split_part(NEW.email, '@', 1)
      END
    ),
    v_is_guest
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- The trigger itself is unchanged from migration 003; recreated so the
-- migration is safe to run on a database that never received 003.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 4. Cleanup for expired guests
-- =====================================================
-- Call from a scheduled job (pg_cron, or a Supabase scheduled Edge Function).
-- Deliberately a function rather than a cron entry: scheduling is an
-- environment decision, and a demo instance and a production instance want
-- different retention.
CREATE OR REPLACE FUNCTION public.delete_expired_guests(retain_days INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER;
BEGIN
  -- Deleting the auth user cascades to the profile and its transactions.
  WITH expired AS (
    DELETE FROM auth.users u
    USING public.profiles p
    WHERE p.id = u.id
      AND p.is_guest = TRUE
      AND p.created_at < NOW() - (retain_days || ' days')::INTERVAL
    RETURNING u.id
  )
  SELECT COUNT(*) INTO removed FROM expired;

  RETURN removed;
END;
$$;

-- Not callable by end users; guests must never be able to invoke it.
REVOKE ALL ON FUNCTION public.delete_expired_guests(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_expired_guests(INTEGER) FROM anon, authenticated;

-- =====================================================
-- 5. Backfill
-- =====================================================
-- Existing rows predate anonymous sign-in, so none of them are guests.
UPDATE public.profiles SET is_guest = FALSE WHERE is_guest IS NULL;
