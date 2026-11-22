\set ON_ERROR_STOP on
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;

\copy (SELECT u.id, btrim(u.email), left(COALESCE(NULLIF(btrim(p.display_name), ''), split_part(u.email, '@', 1)), 100), u.created_at FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE u.email_confirmed_at IS NOT NULL AND btrim(u.email) <> '') TO 'steepwise-accounts.csv' CSV HEADER
\copy (SELECT e.id, e.user_id, 'entry', to_jsonb(e) - ARRAY['id', 'user_id', 'created_at'], e.created_at FROM public.tea_entries e UNION ALL SELECT c.id, c.user_id, 'collection', to_jsonb(c) - ARRAY['id', 'user_id', 'created_at'], c.created_at FROM public.tea_collection c) TO 'steepwise-journal.csv' CSV HEADER

COMMIT;
