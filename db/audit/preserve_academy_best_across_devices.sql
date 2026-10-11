CREATE OR REPLACE FUNCTION public.merge_academy_best() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 NEW.stars := greatest(OLD.stars,NEW.stars);
 NEW.best_wpm := greatest(OLD.best_wpm,NEW.best_wpm);
 NEW.best_accuracy := greatest(OLD.best_accuracy,NEW.best_accuracy);
 RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.merge_academy_best() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER preserve_academy_best BEFORE UPDATE ON public.academy_progress FOR EACH ROW EXECUTE FUNCTION public.merge_academy_best();
