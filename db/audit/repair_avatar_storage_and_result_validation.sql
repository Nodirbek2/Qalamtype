UPDATE public.results SET typing_language='uzbek_latin' WHERE typing_language='uzbek';
ALTER TABLE public.results ADD CONSTRAINT results_valid_metrics CHECK (wpm>=0 AND wpm<'Infinity'::numeric AND raw_wpm>=0 AND raw_wpm<'Infinity'::numeric AND accuracy BETWEEN 0 AND 100);
ALTER TABLE public.results ADD CONSTRAINT results_valid_options CHECK (mode IN ('time','words') AND mode_value>0 AND typing_language IN ('uzbek_latin','uzbek_cyrillic','russian','english') AND difficulty IN ('easy','medium','hard'));
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('avatars','avatars',true,5242880,ARRAY['image/jpeg','image/png','image/webp','image/gif']);
CREATE POLICY "Read own avatar objects" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY "Upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid())::text);
CREATE POLICY "Replace own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid())::text) WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid())::text);
NOTIFY pgrst, 'reload schema';
