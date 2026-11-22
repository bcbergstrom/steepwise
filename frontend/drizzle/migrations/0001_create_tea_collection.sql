CREATE TABLE public.tea_collection (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 200),
 type text NOT NULL CHECK (length(btrim(type)) BETWEEN 1 AND 100),
 origin_country text NOT NULL DEFAULT '' CHECK (length(origin_country) <= 200),
 origin_region text NOT NULL DEFAULT '' CHECK (length(origin_region) <= 200),
 harvest_year integer CHECK (harvest_year BETWEEN 1 AND 9999),
 harvest_season text NOT NULL DEFAULT '' CHECK (length(harvest_season) <= 100),
 quantity_stored text NOT NULL DEFAULT '' CHECK (length(quantity_stored) <= 100),
 notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 5000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tea_collection TO authenticated;
GRANT ALL ON public.tea_collection TO service_role;
ALTER TABLE public.tea_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own collection select" ON public.tea_collection FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own collection insert" ON public.tea_collection FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own collection update" ON public.tea_collection FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own collection delete" ON public.tea_collection FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX tea_collection_user_id_idx ON public.tea_collection(user_id);