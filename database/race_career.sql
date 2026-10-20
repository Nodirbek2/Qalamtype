-- Qalamtype racing career. Existing results and race_finishes remain intact.
create schema if not exists race_private;
revoke all on schema race_private from public;
create table public.race_passages (id bigint generated always as identity primary key, language text not null, passage text not null, unique(language,passage));
alter table public.race_passages enable row level security;
create policy "race passages are public" on public.race_passages for select to anon, authenticated using (true);
grant select on public.race_passages to anon, authenticated;
create table public.race_careers (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 coins integer not null default 0 check(coins>=0), xp integer not null default 0,
 trophies integer not null default 0, races integer not null default 0,
 words integer not null default 0, best_wpm integer not null default 0,
 total_accuracy numeric not null default 0, total_seconds numeric not null default 0,
 owned text[] not null default array['spark'], equipped text not null default 'spark'
);
alter table public.race_careers enable row level security;
create policy "public racing stats" on public.race_careers for select to anon,authenticated using (true);
grant select on public.race_careers to anon,authenticated;
create table race_private.sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 passage text not null, starts_at timestamptz not null, completed boolean not null default false,
 reward jsonb
);
create index on race_private.sessions(user_id, starts_at);
alter table race_private.sessions enable row level security;
create function race_private.start_race(p_language text,p_passage text,p_starts_at timestamptz) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_id uuid;
begin
 if v_uid is null then raise exception 'authentication_required'; end if;
 if not exists(select 1 from public.race_passages where language=p_language and passage=p_passage) then raise exception 'invalid_passage'; end if;
 if p_starts_at<now()-interval '10 seconds' or p_starts_at>now()+interval '15 seconds' then raise exception 'invalid_start'; end if;
 if (select count(*) from race_private.sessions where user_id=v_uid and starts_at>now()-interval '1 minute')>=12 then raise exception 'rate_limit'; end if;
 insert into public.race_careers(user_id) values(v_uid) on conflict do nothing;
 insert into race_private.sessions(user_id,passage,starts_at) values(v_uid,p_passage,p_starts_at) returning id into v_id;
 return v_id;
end $$;
create function public.start_race_career(p_language text,p_passage text,p_starts_at timestamptz) returns uuid
language sql security invoker set search_path='' as $$ select race_private.start_race(p_language,p_passage,p_starts_at) $$;
create function race_private.finish_race(p_session uuid,p_text text,p_seconds numeric,p_errors integer) returns jsonb
language plpgsql security definer set search_path='' as $$
<<finish>>
declare v_uid uuid:=auth.uid(); s race_private.sessions; n integer; speed integer; acc numeric; coins integer; xp integer; trophies integer; reward jsonb;
begin
 if v_uid is null then raise exception 'authentication_required'; end if;
 select * into s from race_private.sessions where id=p_session and user_id=v_uid for update;
 if not found then raise exception 'invalid_session'; end if;
 if s.completed then return s.reward; end if;
 if p_text<>s.passage or p_errors<0 or p_errors>10000 or p_seconds<3 or p_seconds>120.5 or extract(epoch from now()-s.starts_at)<p_seconds-2 or now()-s.starts_at>interval '1 day' then raise exception 'invalid_finish'; end if;
 speed:=round(length(s.passage)*12/p_seconds);
 if speed<1 or speed>400 then raise exception 'invalid_speed'; end if;
 n:=cardinality(regexp_split_to_array(trim(s.passage),'\s+'));
 acc:=round(100.0*length(s.passage)/(length(s.passage)+p_errors),1);
 coins:=20+floor(n/3.0)::int+floor(acc/10)::int;
 xp:=n+floor(acc/5)::int; trophies:=10+floor(acc/20)::int;
 reward:=jsonb_build_object('coins',coins,'xp',xp,'trophies',trophies,'wpm',speed,'accuracy',acc,'words',n);
 update public.race_careers c set coins=c.coins+finish.coins,xp=c.xp+finish.xp,trophies=c.trophies+finish.trophies,races=c.races+1,words=c.words+n,best_wpm=greatest(c.best_wpm,speed),total_accuracy=c.total_accuracy+acc,total_seconds=c.total_seconds+p_seconds where c.user_id=v_uid;
 insert into public.race_finishes(id,user_id,words,wpm) values(s.id,v_uid,n,speed) on conflict(id) do nothing;
 update race_private.sessions set completed=true,reward=finish.reward where id=s.id;
 return reward;
end $$;
-- Distinct variable names avoid ambiguity with table columns in PL/pgSQL.
create function public.finish_race_career(p_session uuid,p_text text,p_seconds numeric,p_errors integer) returns jsonb
language sql security invoker set search_path='' as $$ select race_private.finish_race(p_session,p_text,p_seconds,p_errors) $$;
create function race_private.equip_car(p_car text) returns public.race_careers
language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); c public.race_careers; price integer;
begin
 if v_uid is null then raise exception 'authentication_required'; end if;
 price:=case p_car when 'spark' then 0 when 'comet' then 200 when 'pulse' then 500 when 'phantom' then 1000 when 'apex' then 2000 else null end;
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
create function public.equip_race_car(p_car text) returns public.race_careers
language sql security invoker set search_path='' as $$ select race_private.equip_car(p_car) $$;
-- Only these authenticated entry points can modify career balances.
grant usage on schema race_private to authenticated;
revoke all on all functions in schema race_private from public,anon;
grant execute on all functions in schema race_private to authenticated;
revoke all on function public.start_race_career(text,text,timestamptz),public.finish_race_career(uuid,text,numeric,integer),public.equip_race_car(text) from public,anon;
grant execute on function public.start_race_career(text,text,timestamptz),public.finish_race_career(uuid,text,numeric,integer),public.equip_race_car(text) to authenticated;
create view public.race_career_rankings with(security_invoker=true) as select c.*,p.username from public.race_careers c join public.profiles p on p.id=c.user_id;
grant select on public.race_career_rankings to anon,authenticated;
revoke insert,update,delete,truncate,references,trigger on public.race_careers,public.race_passages from anon,authenticated;
revoke all on all tables in schema race_private from anon,authenticated;
create index race_careers_rank_idx on public.race_careers(trophies desc,words desc,user_id);
