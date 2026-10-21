-- Add Damas to the existing authenticated purchase/equip catalog.
create or replace function race_private.equip_car(p_car text) returns public.race_careers
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); c public.race_careers; price integer;
begin
 if v_uid is null then raise exception 'authentication_required'; end if;
 price:=case p_car when 'tico' then 0 when 'jiguli' then 150 when 'nexia1' then 350 when 'nexia2' then 650 when 'damas' then 850 when 'spark' then 1000 when 'lacetti' then 1500 when 'cobalt' then 2200 when 'gentra' then 3200 when 'malibu' then 5000 when 'tahoe' then 8000 when 'gwagon' then 12000 else null end;
 if price is null then raise exception 'invalid_car'; end if;
 insert into public.race_careers(user_id) values(v_uid) on conflict do nothing;
 select * into c from public.race_careers where user_id=v_uid for update;
 if not p_car=any(c.owned) then
  if c.coins<price then raise exception 'insufficient_coins'; end if;
  update public.race_careers set coins=coins-price,owned=array_append(owned,p_car) where user_id=v_uid;
 end if;
 update public.race_careers set equipped=p_car where user_id=v_uid returning * into c;
 return c;
end $$;
