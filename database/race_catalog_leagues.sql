-- One-time catalog migration; balances and earned trophies are retained.
alter table public.race_careers add column catalog_version integer not null default 1;
update public.race_careers c set
 coins=coins+(case when 'comet'=any(owned) then 50 else 0 end)+(case when 'pulse'=any(owned) then 150 else 0 end)+(case when 'phantom'=any(owned) then 350 else 0 end)+(case when 'apex'=any(owned) then 500 else 0 end),
 owned=array(select distinct mapped from (select 'tico' as mapped union all select case id when 'spark' then 'tico' when 'comet' then 'jiguli' when 'pulse' then 'nexia1' when 'phantom' then 'nexia2' when 'apex' then 'lacetti' else id end from unnest(c.owned) id) x),
 equipped=case equipped when 'spark' then 'tico' when 'comet' then 'jiguli' when 'pulse' then 'nexia1' when 'phantom' then 'nexia2' when 'apex' then 'lacetti' else equipped end,catalog_version=2 where catalog_version=1;
alter table public.race_careers alter column owned set default array['tico'];
alter table public.race_careers alter column equipped set default 'tico';
alter table public.race_careers alter column catalog_version set default 2;
create or replace function race_private.equip_car(p_car text) returns public.race_careers
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); c public.race_careers; price integer;
begin
 if v_uid is null then raise exception 'authentication_required'; end if;
 price:=case p_car when 'tico' then 0 when 'jiguli' then 150 when 'nexia1' then 350 when 'nexia2' then 650 when 'spark' then 1000 when 'lacetti' then 1500 when 'cobalt' then 2200 when 'gentra' then 3200 when 'malibu' then 5000 when 'tahoe' then 8000 when 'gwagon' then 12000 else null end;
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
create or replace function public.race_league_board(p_league integer,p_offset integer default null) returns jsonb
language sql stable security invoker set search_path='' as $$
with classified as (
 select r.*,case when trophies>=5000 then 4 when trophies>=2000 then 3 when trophies>=700 then 2 when trophies>=200 then 1 else 0 end as league
 from public.race_career_rankings r where races>0
), ranked as (
 select c.*,row_number() over(partition by league order by trophies desc,words desc,user_id) as position,count(*) over(partition by league) as league_total from classified c
), me as (select * from ranked where user_id=(select auth.uid())), bounds as (
 select case when p_offset is not null then greatest(0,p_offset)+1 when (select league from me)=p_league then greatest(1,(select position from me)-4) else 1 end as lo,
 case when p_offset is not null then greatest(0,p_offset)+9 when (select league from me)=p_league then (select position from me)+4 else 9 end as hi
)
select jsonb_build_object('entries',coalesce((select jsonb_agg(jsonb_build_object('user_id',user_id,'username',username,'trophies',trophies,'races',races,'best_wpm',best_wpm,'position',position) order by position) from ranked,bounds where league=p_league and position between lo and hi),'[]'::jsonb),
 'total',(select count(*) from classified where league=p_league),'my_rank',(select position from me),'my_league',(select league from me),'my_total',(select league_total from me),'start',(select lo from bounds),'end',(select hi from bounds));
$$;
revoke all on function public.race_league_board(integer,integer) from public;
grant execute on function public.race_league_board(integer,integer) to anon,authenticated;
