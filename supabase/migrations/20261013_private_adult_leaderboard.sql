-- JOY VIMO: optional, privacy-minimizing ADULT leaderboard.
-- Deploy only into a dedicated JOY VIMO Supabase project after reviewing
-- Authentication, email limits, RLS and privacy policy. NOT deployed by CI.
-- Never store adult-site URLs, intimate behavior, contact details or video history.
create extension if not exists pgcrypto;

create table if not exists public.joy_public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_alias text not null unique,
  country_code text not null default 'XX'
    check (country_code ~ '^[A-Z]{2}$'),
  visible boolean not null default false,
  adult_self_declared boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.joy_positive_actions (
  user_id uuid not null references auth.users(id) on delete cascade,
  action_day date not null,
  action_key text not null
    check (action_key in ('plan','offline','break','reflect','reset',
                         'joy-nature-spot','joy-animal-memory','joy-creative-doodle',
                         'joy-learning-spark','joy-comedy-smile','joy-calm-five')),
  points smallint not null check(points in (10,15,20)),
  created_at timestamptz not null default now(),
  primary key(user_id,action_day,action_key)
);
create index if not exists joy_positive_actions_day_idx
  on public.joy_positive_actions(action_day,user_id);
create index if not exists joy_public_profiles_country_idx
  on public.joy_public_profiles(country_code) where visible;

alter table public.joy_public_profiles enable row level security;
alter table public.joy_positive_actions enable row level security;
revoke all on public.joy_public_profiles from anon,authenticated;
revoke all on public.joy_positive_actions from anon,authenticated;
grant select on public.joy_public_profiles to authenticated;
grant select on public.joy_positive_actions to authenticated;

drop policy if exists joy_profile_owner_read on public.joy_public_profiles;
create policy joy_profile_owner_read on public.joy_public_profiles
  for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists joy_positive_owner_read on public.joy_positive_actions;
create policy joy_positive_owner_read on public.joy_positive_actions
  for select to authenticated using (user_id=(select auth.uid()));
-- No direct insert/update/delete policies. Authenticated client writes through
-- audited security-definer functions below, never writes score values itself.

create or replace function public.joy_join_leaderboard(p_country text default 'XX')
returns table(alias text,country text)
language plpgsql security definer set search_path=''
as $$
declare
  u uuid := (select auth.uid());
  c text := upper(trim(coalesce(p_country,'XX')));
  created_alias text;
begin
  if u is null then raise exception 'Login required'; end if;
  if c !~ '^[A-Z]{2}$' then raise exception 'Invalid region'; end if;
  -- Caller must explicitly opt in and declare they are an adult.
  insert into public.joy_public_profiles(user_id,public_alias,country_code,adult_self_declared,visible)
  values(u, 'JV-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),c,true,true)
  on conflict(user_id) do update
    set country_code=excluded.country_code,
        adult_self_declared=true,visible=true;
  return query
    select p.public_alias,p.country_code from public.joy_public_profiles p where p.user_id=u;
end $$;

create or replace function public.joy_leave_leaderboard()
returns boolean language plpgsql security definer set search_path=''
as $$
begin
  if (select auth.uid()) is null then raise exception 'Login required'; end if;
  update public.joy_public_profiles set visible=false,adult_self_declared=false
    where user_id=(select auth.uid());
  return true;
end $$;

create or replace function public.joy_delete_leaderboard_data()
returns boolean language plpgsql security definer set search_path=''
as $$
begin
  if (select auth.uid()) is null then raise exception 'Login required'; end if;
  delete from public.joy_positive_actions where user_id=(select auth.uid());
  delete from public.joy_public_profiles where user_id=(select auth.uid());
  return true;
end $$;

create or replace function public.joy_claim_positive_action(p_action_key text)
returns table(accepted boolean,weekly_points integer)
language plpgsql security definer set search_path=''
as $$
declare
  u uuid := (select auth.uid());
  score smallint;
  success boolean := false;
  inserted_count integer := 0;
begin
  if u is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.joy_public_profiles
       where user_id=u and visible and adult_self_declared)
  then raise exception 'Join adult leaderboard first'; end if;
  score := case p_action_key
    when 'plan' then 10 when 'offline' then 20 when 'break' then 15
    when 'reflect' then 10 when 'reset' then 15
    when 'joy-nature-spot' then 10 when 'joy-animal-memory' then 10
    when 'joy-creative-doodle' then 10 when 'joy-learning-spark' then 10
    when 'joy-comedy-smile' then 10 when 'joy-calm-five' then 10
    else null end;
  if score is null then raise exception 'Unknown positive action'; end if;
  insert into public.joy_positive_actions(user_id,action_day,action_key,points)
    values(u,(now() at time zone 'UTC')::date,p_action_key,score)
    on conflict do nothing;
  get diagnostics inserted_count = row_count;
  success := inserted_count > 0;
  return query select success,
    coalesce(sum(a.points),0)::integer from public.joy_positive_actions a
    where a.user_id=u and a.action_day >= date_trunc('week',now() at time zone 'UTC')::date;
end $$;

create or replace function public.joy_weekly_leaderboard(p_country text default null)
returns table(alias text,country text,points bigint,rank bigint)
language sql stable security definer set search_path=''
as $$
  with totals as (
    select p.user_id,p.public_alias,p.country_code,coalesce(sum(a.points),0)::bigint as total
      from public.joy_public_profiles p
      left join public.joy_positive_actions a
        on a.user_id=p.user_id
       and a.action_day>=date_trunc('week',now() at time zone 'UTC')::date
      where p.visible and p.adult_self_declared and
        (p_country is null or p.country_code=upper(p_country))
      group by p.user_id,p.public_alias,p.country_code
  )
  select t.public_alias,t.country_code,t.total,
      row_number() over(order by t.total desc,t.public_alias asc)
      from totals t
      order by t.total desc,t.public_alias asc
      limit 50
$$;

revoke all on function public.joy_join_leaderboard(text) from public,anon;
revoke all on function public.joy_leave_leaderboard() from public,anon;
revoke all on function public.joy_delete_leaderboard_data() from public,anon;
revoke all on function public.joy_claim_positive_action(text) from public,anon;
revoke all on function public.joy_weekly_leaderboard(text) from public,anon;
grant execute on function public.joy_join_leaderboard(text) to authenticated;
grant execute on function public.joy_leave_leaderboard() to authenticated;
grant execute on function public.joy_delete_leaderboard_data() to authenticated;
grant execute on function public.joy_claim_positive_action(text) to authenticated;
grant execute on function public.joy_weekly_leaderboard(text) to authenticated;
