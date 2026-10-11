ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_complete boolean NOT NULL DEFAULT false;
UPDATE public.profiles SET is_profile_complete = true WHERE coalesce(trim(first_name),'') <> '' AND coalesce(trim(last_name),'') <> '';
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS results_user_created_idx ON public.results (user_id, created_at);
ALTER POLICY "Users insert own profile" ON public.profiles TO authenticated WITH CHECK ((select auth.uid()) = id);
ALTER POLICY "Users update own profile" ON public.profiles TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
ALTER POLICY "Users insert own result" ON public.results TO authenticated WITH CHECK ((select auth.uid()) = user_id);
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
CREATE TABLE public.academy_progress (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 lesson_id text NOT NULL,
 language text NOT NULL CHECK (language IN ('uzbek_latin','uzbek_cyrillic','english','russian')),
 tier integer NOT NULL CHECK (tier > 0),
 stars integer NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
 best_wpm numeric NOT NULL DEFAULT 0 CHECK (best_wpm >= 0 AND best_wpm < 'Infinity'::numeric),
 best_accuracy numeric NOT NULL DEFAULT 0 CHECK (best_accuracy BETWEEN 0 AND 100),
 completed_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, lesson_id, language)
);
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.academy_progress TO authenticated;
CREATE POLICY "Read own academy progress" ON public.academy_progress FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Insert own academy progress" ON public.academy_progress FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Update own academy progress" ON public.academy_progress FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.results;
NOTIFY pgrst, 'reload schema';
