// Statistiques d'usage (PostHog, serveurs UE) : quelles pages sont vues et où
// les visiteurs décrochent. Clé publique (côté client par nature).
// Réglées pour rester anonymes et sans consentement (recommandations CNIL sur la
// mesure d'audience) : mode « cookieless » de PostHog (aucun cookie ni stockage
// sur l'appareil ; visiteurs comptés par une empreinte serveur renouvelée chaque
// jour, IP non conservée), aucune identification (pas d'e-mail, pas de profil de
// personne), pas d'enregistrement de session. Prérequis côté PostHog : activer
// « Cookieless server hash mode » (Project settings → Web analytics).
// Décrit sur /academy/confidentialite.
import Script from "next/script";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_xgP4aETZvboxeeB9RbPJQSZM2PQgoqrzyYo8oQJ6PY9f";

export default function Analytics() {
  const snippet = `
if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(${JSON.stringify(KEY)}, { api_host: "https://eu.i.posthog.com", ui_host: "https://eu.posthog.com", defaults: "2025-05-24", cookieless_mode: "always", person_profiles: "never", disable_session_recording: true, disable_surveys: true });
}`;
  return <Script id="posthog-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: snippet }} />;
}
