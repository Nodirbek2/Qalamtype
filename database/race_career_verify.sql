-- Transactional smoke test: no profile balance or test race is retained.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles limit 1),true);
set local role authenticated;
do $$
declare v_id uuid; v_text text; r jsonb; before_coins integer; after_coins integer;
begin
 select passage into v_text from public.race_passages where language='uzbek_latin' limit 1;
 v_id:=public.start_race_career('uzbek_latin',v_text,now()-interval '9 seconds');
 r:=public.finish_race_career(v_id,v_text,9,2);
 select coins into before_coins from public.race_careers where user_id=auth.uid();
 perform public.finish_race_career(v_id,v_text,9,2);
 select coins into after_coins from public.race_careers where user_id=auth.uid();
 if before_coins<>after_coins then raise exception 'duplicate reward'; end if;
 perform public.equip_race_car('spark');
 if (r->>'coins')::int<=0 then raise exception 'missing reward'; end if;
end $$;
rollback;
