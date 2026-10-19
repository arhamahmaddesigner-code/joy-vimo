-- Forward-only repair: COALESCE is SQL syntax, not a schema-qualified function.
-- Existing deployed migration history must not be rewritten. JOY VIMO project only.
-- JOY VIMO adult opt-in privacy hardening. Dedicated JOY project only.
-- Signed-in status alone must not grant access to adult public rankings.
create or replace function public.joy_weekly_leaderboard(p_country text default null)
returns table(alias text, country text, points bigint, rank bigint)
language plpgsql stable security definer set search_path=''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Login required' using errcode='42501';
  end if;
  if not exists (
    select 1 from public.joy_public_profiles p
    where p.user_id = (select auth.uid()) and p.visible and p.adult_self_declared
  ) then
    raise exception 'Join the adult leaderboard before viewing rankings' using errcode='42501';
  end if;
  if p_country is not null and pg_catalog.upper(pg_catalog.btrim(p_country)) !~ '^[A-Z]{2}$' then
    raise exception 'Invalid country code' using errcode='22023';
  end if;
  return query
    with totals as (
      select p.user_id, p.public_alias, p.country_code,
             coalesce(pg_catalog.sum(a.points),0)::bigint as total
      from public.joy_public_profiles p
      left join public.joy_positive_actions a
        on a.user_id=p.user_id
       and a.action_day >= pg_catalog.date_trunc('week', now() at time zone 'UTC')::date
      where p.visible and p.adult_self_declared
        and (p_country is null or p.country_code=pg_catalog.upper(pg_catalog.btrim(p_country)))
      group by p.user_id,p.public_alias,p.country_code
    )
    select t.public_alias, t.country_code, t.total,
      row_number() over (order by t.total desc,t.public_alias asc)
    from totals t
    order by t.total desc,t.public_alias asc limit 50;
end
$$;
revoke all on function public.joy_weekly_leaderboard(text) from public, anon;
grant execute on function public.joy_weekly_leaderboard(text) to authenticated;
