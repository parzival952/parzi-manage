-- migration-032 — « Supprimer mon compte » (droit à l'effacement, RGPD art. 17).
--
-- L'élève connecté appelle /rest/v1/rpc/delete_my_account avec SON jeton :
-- la fonction supprime SA ligne auth.users (auth.uid(), jamais un identifiant
-- passé en paramètre). Toutes les tables de données personnelles référencent
-- auth.users(id) avec ON DELETE CASCADE (profils, progression Academy,
-- inscription, simulations, notes, portefeuille Manage…) : tout part avec.
--
-- SECURITY DEFINER : seul le propriétaire (postgres) peut supprimer dans
-- auth.users. search_path vide + noms qualifiés : pas de détournement possible.
-- Exécutable uniquement par `authenticated` (pas anon, pas public).
--
-- Idempotente. Retour arrière : drop function public.delete_my_account();

begin;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié' using errcode = '28000';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

commit;
