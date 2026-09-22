-- R-006 — propriété utilisateur, clés étrangères et suppression de compte.
--
-- Cette migration est volontairement bloquante : elle ne corrige, ne supprime
-- et ne réattribue aucune donnée. Tout NULL ou orphelin doit être résolu par une
-- décision documentée avant son exécution.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '2min';

do $r006$
declare
  table_name text;
  null_count bigint;
  orphan_count bigint;
  constraint_name text;
  constraint_valid boolean;
  constraint_matches boolean;
begin
  foreach table_name in array array[
    'academy_done',
    'academy_progress',
    'ai_messages',
    'alerts',
    'certifications',
    'clubs',
    'contacts',
    'daily_briefs',
    'events',
    'opportunities',
    'players',
    'profiles',
    'prospects',
    'recommendations',
    'tasks'
  ] loop
    constraint_name := table_name || '_user_id_auth_users_fkey';

    execute format(
      'select count(*) from public.%I where user_id is null',
      table_name
    ) into null_count;

    if null_count <> 0 then
      raise exception 'R-006 bloqué : public.% contient % user_id NULL',
        table_name, null_count;
    end if;

    execute format(
      'select count(*) from public.%1$I child '
      'left join auth.users parent on parent.id = child.user_id '
      'where parent.id is null',
      table_name
    ) into orphan_count;

    if orphan_count <> 0 then
      raise exception 'R-006 bloqué : public.% contient % user_id orphelin(s)',
        table_name, orphan_count;
    end if;

    select
      c.convalidated,
      c.contype = 'f'
        and c.conrelid = format('public.%I', table_name)::regclass
        and c.confrelid = 'auth.users'::regclass
        and c.confdeltype = 'c'
        and c.conkey = array[
          (select attnum from pg_attribute
           where attrelid = format('public.%I', table_name)::regclass
             and attname = 'user_id')
        ]::smallint[]
        and c.confkey = array[
          (select attnum from pg_attribute
           where attrelid = 'auth.users'::regclass
             and attname = 'id')
        ]::smallint[]
      into constraint_valid, constraint_matches
      from pg_constraint c
      where c.conname = constraint_name
        and c.connamespace = 'public'::regnamespace;

    if constraint_matches is false then
      raise exception 'R-006 bloqué : la contrainte % existe avec une définition incompatible',
        constraint_name;
    end if;

    if constraint_matches is null then
      execute format(
        'alter table public.%1$I add constraint %2$I '
        'foreign key (user_id) references auth.users(id) '
        'on delete cascade not valid',
        table_name,
        constraint_name
      );
      constraint_valid := false;
    end if;

    if not constraint_valid then
      execute format(
        'alter table public.%1$I validate constraint %2$I',
        table_name,
        constraint_name
      );
    end if;

    execute format(
      'alter table public.%I alter column user_id set not null',
      table_name
    );
  end loop;
end
$r006$;

commit;
