begin;

create or replace function
  public.get_latest_academy_diagnostic_report()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt public.academy_diagnostic_attempts%rowtype;
  v_total_xp integer := 0;
  v_trophies jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  select *
  into v_attempt
  from public.academy_diagnostic_attempts
  where user_id = v_user_id
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'found', false,
      'attempt', null,
      'totalXp', 0,
      'trophies', '[]'::jsonb
    );
  end if;

  select coalesce(xp, 0)
  into v_total_xp
  from public.academy_progress
  where user_id = v_user_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', trophy_id,
        'metadata', metadata,
        'unlockedAt', unlocked_at
      )
      order by unlocked_at asc
    ),
    '[]'::jsonb
  )
  into v_trophies
  from public.academy_trophies
  where user_id = v_user_id;

  return jsonb_build_object(
    'found', true,
    'attempt', to_jsonb(v_attempt),
    'totalXp', coalesce(v_total_xp, 0),
    'trophies', v_trophies
  );
end;
$$;

revoke all on function
  public.get_latest_academy_diagnostic_report()
from public, anon;

grant execute on function
  public.get_latest_academy_diagnostic_report()
to authenticated;

commit;
