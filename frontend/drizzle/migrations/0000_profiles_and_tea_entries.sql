CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.tea_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Green',
  temp text NOT NULL DEFAULT '',
  steep_time text NOT NULL DEFAULT '',
  rating int NOT NULL DEFAULT 4,
  notes text NOT NULL DEFAULT '',
  brewed_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tea_entries TO authenticated;
GRANT ALL ON public.tea_entries TO service_role;
ALTER TABLE public.tea_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own entries select" ON public.tea_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own entries insert" ON public.tea_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own entries update" ON public.tea_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own entries delete" ON public.tea_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX tea_entries_user_idx ON public.tea_entries(user_id, created_at DESC);