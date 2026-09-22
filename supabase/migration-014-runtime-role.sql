-- R-005 — rôles PostgreSQL applicatifs à privilèges minimaux.
--
-- IMPORTANT : ce fichier prépare les rôles mais ne leur donne ni LOGIN ni mot
-- de passe. Ne pas l'exécuter en production avant validation de la procédure
-- docs/hardening/R-005_LEAST_PRIVILEGE_DB_ROLE.md.

begin;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'parzi_app_runtime') then
    create role parzi_app_runtime
      nologin
      inherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication
      nobypassrls;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'parzi_app_preview') then
    create role parzi_app_preview
      nologin
      inherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication
      bypassrls
      connection limit 5;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'parzi_app_production') then
    create role parzi_app_production
      nologin
      inherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication
      bypassrls
      connection limit 10;
  end if;
end
$$;

-- Supabase autorise ces attributs sensibles lors du CREATE ROLE, mais son rôle
-- postgres managé ne peut pas les réaffirmer ensuite avec ALTER ROLE. Les
-- attributs modifiables sont donc normalisés, puis les autres sont contrôlés.
alter role parzi_app_runtime nologin inherit connection limit -1;
alter role parzi_app_preview nologin inherit connection limit 5;
alter role parzi_app_production nologin inherit connection limit 10;

do $$
declare
  invalid_role text;
begin
  select rolname
    into invalid_role
    from pg_roles
   where rolname in ('parzi_app_runtime', 'parzi_app_preview', 'parzi_app_production')
     and (rolsuper or rolcreatedb or rolcreaterole or rolreplication or rolcanlogin or not rolinherit)
   limit 1;

  if invalid_role is not null then
    raise exception '% possède des attributs incompatibles avec R-005', invalid_role;
  end if;

  if (select rolbypassrls from pg_roles where rolname = 'parzi_app_runtime') then
    raise exception 'parzi_app_runtime possède BYPASSRLS';
  end if;

  if not (select rolbypassrls from pg_roles where rolname = 'parzi_app_preview') then
    raise exception 'parzi_app_preview ne possède pas BYPASSRLS';
  end if;

  if not (select rolbypassrls from pg_roles where rolname = 'parzi_app_production') then
    raise exception 'parzi_app_production ne possède pas BYPASSRLS';
  end if;
end
$$;

grant parzi_app_runtime to parzi_app_preview;
grant parzi_app_runtime to parzi_app_production;

do $$
begin
  execute format('grant connect on database %I to parzi_app_runtime', current_database());
end
$$;

grant usage on schema public to parzi_app_runtime;

-- Lecture : toutes les tables interrogées par le serveur.
grant select on table
  public.players,
  public.tasks,
  public.alerts,
  public.events,
  public.opportunities,
  public.contacts,
  public.clubs,
  public.prospects,
  public.ai_messages,
  public.daily_briefs,
  public.recommendations,
  public.profiles,
  public.academy_progress,
  public.academy_done,
  public.certifications
to parzi_app_runtime;

-- Création : uniquement les tables alimentées par les parcours applicatifs.
grant insert on table
  public.players,
  public.tasks,
  public.alerts,
  public.events,
  public.opportunities,
  public.contacts,
  public.clubs,
  public.prospects,
  public.ai_messages,
  public.daily_briefs,
  public.recommendations,
  public.profiles,
  public.academy_progress,
  public.academy_done,
  public.certifications
to parzi_app_runtime;

-- Modification : seulement les tables réellement mises à jour par le code.
grant update on table
  public.players,
  public.tasks,
  public.profiles,
  public.academy_progress
to parzi_app_runtime;

-- Suppression : seulement les parcours qui exposent cette opération.
grant delete on table
  public.players,
  public.clubs,
  public.prospects,
  public.events,
  public.ai_messages,
  public.daily_briefs,
  public.recommendations
to parzi_app_runtime;

-- Les colonnes identity utilisent nextval ; aucun setval n'est requis.
grant usage on sequence
  public.players_id_seq,
  public.tasks_id_seq,
  public.alerts_id_seq,
  public.events_id_seq,
  public.opportunities_id_seq,
  public.contacts_id_seq,
  public.clubs_id_seq,
  public.prospects_id_seq,
  public.ai_messages_id_seq,
  public.daily_briefs_id_seq,
  public.recommendations_id_seq,
  public.certifications_id_seq
to parzi_app_runtime;

-- Garde-fous : aucun rôle applicatif ne doit hériter de DDL ou TRUNCATE.
do $$
declare
  role_name text;
  table_name text;
begin
  foreach role_name in array array['parzi_app_preview', 'parzi_app_production'] loop
    if has_schema_privilege(role_name, 'public', 'create') then
      raise exception '% possède CREATE sur le schéma public', role_name;
    end if;

    foreach table_name in array array[
      'players', 'tasks', 'alerts', 'events', 'opportunities', 'contacts',
      'clubs', 'prospects', 'ai_messages', 'daily_briefs', 'recommendations',
      'profiles', 'academy_progress', 'academy_done', 'certifications'
    ] loop
      if has_table_privilege(role_name, format('public.%I', table_name), 'truncate') then
        raise exception '% possède TRUNCATE sur public.%', role_name, table_name;
      end if;
    end loop;
  end loop;
end
$$;

commit;
