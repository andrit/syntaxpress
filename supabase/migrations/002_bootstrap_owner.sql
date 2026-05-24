-- ══════════════════════════════════════════════
-- Bootstrap: Auto-promote first signup to owner
-- ══════════════════════════════════════════════
-- This trigger fires after a user signs up via Supabase Auth.
-- If the admin_users table is empty, the first user becomes
-- the owner. All subsequent signups are ignored (they must
-- be manually added to admin_users by the owner).
--
-- This means: sign up once, you're the admin. Nobody else
-- can grant themselves access by signing up.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-promote if no admin users exist yet
  IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
    INSERT INTO public.admin_users (id, email, role)
    VALUES (NEW.id, NEW.email, 'owner');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
