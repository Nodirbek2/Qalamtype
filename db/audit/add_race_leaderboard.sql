create table public.race_finishes (
 id uuid primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 words integer not null check (words between 1 and 1000),
 wpm integer not null check (wpm between 1 and 400),
 created_at timestamptz not null default now()
);
alter table public.race_finishes enable row level security;
create policy "Read public race scores" on public.race_finishes for select to anon, authenticated using (true);
create policy "Save own completed race" on public.race_finishes for insert to authenticated with check ((select auth.uid()) = user_id);
grant select on public.race_finishes to anon, authenticated;
grant insert on public.race_finishes to authenticated;
create index race_finishes_user_idx on public.race_finishes(user_id);
create view public.race_leaderboard with (security_invoker = true) as
 select f.user_id, p.username, sum(f.words)::bigint as total_words, count(*)::bigint as races, max(f.wpm) as best_wpm
 from public.race_finishes f join public.profiles p on p.id=f.user_id
 group by f.user_id,p.username;
grant select on public.race_leaderboard to anon, authenticated;
