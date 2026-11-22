ALTER TABLE public.tea_collection ADD COLUMN recommended_temp_min numeric, ADD COLUMN recommended_temp_max numeric;
ALTER TABLE public.tea_collection ADD CONSTRAINT tea_temperature_range CHECK (
 (recommended_temp_min IS NULL AND recommended_temp_max IS NULL) OR
 (recommended_temp_min IS NOT NULL AND recommended_temp_max IS NOT NULL AND
 recommended_temp_min >= 0 AND recommended_temp_max <= 100 AND recommended_temp_min <= recommended_temp_max)
);