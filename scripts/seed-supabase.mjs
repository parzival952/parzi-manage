// Seed Supabase — exécute la migration + insère les données de démo.
// Usage : DATABASE_URL="postgresql://..." node scripts/seed-supabase.mjs
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquante");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", prepare: false, max: 1 });

const migration = fs.readFileSync(path.join(root, "supabase", "migration-001-initial.sql"), "utf8");

try {
  console.log("→ Migration…");
  await sql.unsafe(migration);

  const { n } = (await sql`SELECT COUNT(*)::int AS n FROM players`)[0];
  if (n > 0) {
    console.log(`→ Base déjà peuplée (${n} joueurs) — seed ignoré.`);
  } else {
    console.log("→ Seed des données de démo…");
    await sql`INSERT INTO players (name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes) VALUES
      ('K. Diarra','Milieu central',21,'Valenciennes FC','Juin 2027','6,5 M€','soon','Contrat < 12 mois','28 K€/mois','Exclusif · exp. 03/2027','Droit','1,84 m','France / Mali','Intérêt concret du RC Strasbourg. Ouvrir la négociation avant le mercato d''hiver.'),
      ('M. Lopes','Ailier droit',23,'FC Famalicão (prêt)','Juin 2028','4,2 M€','ok','Sous contrat','22 K€/mois','Co-mandat DF Sports · exp. 09/2027','Gauche','1,76 m','Portugal','Retour de blessure validé. Reprise collective lundi.'),
      ('A. Bensaïd','Latéral gauche',24,'SM Caen','Juin 2027','3,8 M€','soon','Contrat < 12 mois','19 K€/mois','Exclusif · exp. 01/2028','Gauche','1,79 m','France / Maroc','Profil piston — compatible Sunderland.'),
      ('T. Kowalski','Défenseur central',26,'LOSC Lille','Juin 2029','12,0 M€','ok','Prolongation en cours','65 K€/mois','Exclusif · exp. 06/2028','Droit','1,91 m','Pologne','Cible : +40 % salaire, clause 25 M€.'),
      ('S. Traoré','Attaquant',19,'AS Nancy (centre)','Juin 2027','1,5 M€','urgent','Mandat exp. 21 j','6 K€/mois','Exclusif · exp. 08/2026 ⚠','Droit','1,86 m','France / Côte d''Ivoire','PRIORITÉ : renouvellement du mandat sous 21 jours.'),
      ('J. Mensah','Avant-centre',22,'Rodez AF','Juin 2028','5,0 M€','ok','Sous contrat','24 K€/mois','Exclusif · exp. 05/2027','Droit','1,88 m','Ghana','Joueur du mois L2. Intérêt du FC Utrecht.'),
      ('L. Fernandes','Milieu offensif',20,'Grenoble Foot 38','Juin 2029','2,8 M€','ok','Sous contrat','14 K€/mois','Exclusif · exp. 11/2027','Gauche','1,74 m','France / Portugal','Progression régulière.'),
      ('Y. Petit','Latéral droit',25,'Paris FC','Juin 2027','3,2 M€','soon','Contrat < 12 mois','21 K€/mois','Exclusif · exp. 04/2027','Droit','1,81 m','France','Opportunité LOSC (joker médical).'),
      ('E. Okafor','Gardien',27,'USL Dunkerque','Juin 2028','1,8 M€','ok','Sous contrat','16 K€/mois','Exclusif · exp. 02/2028','Droit','1,93 m','Nigeria','Saison solide.'),
      ('R. Duval','Milieu défensif',18,'FC Metz (U19)','Aspirant','—','ok','Jeune — 1er pro visé','—','Exclusif · exp. 07/2028','Droit','1,82 m','France','Objectif : premier contrat pro cet hiver.'),
      ('N. Haddad','Ailier gauche',22,'Clermont Foot','Juin 2028','3,5 M€','ok','Sous contrat','18 K€/mois','Exclusif · exp. 10/2027','Droit','1,77 m','France / Tunisie','Deux sélections espoirs.'),
      ('P. Sørensen','Défenseur central',24,'Amiens SC','Juin 2027','2,6 M€','soon','Contrat < 12 mois','17 K€/mois','Exclusif · exp. 12/2027','Gauche','1,90 m','Danemark','Gaucher recherché.')`;
    await sql`INSERT INTO tasks (title, due_label, is_late, is_done) VALUES
      ('Envoyer le renouvellement de mandat à S. Traoré','Auj.',true,false),
      ('Finaliser le benchmark salarial T. Kowalski','Auj. 13h',false,true),
      ('Dossier joueur K. Diarra → RC Strasbourg','Demain',false,false),
      ('Réserver le déplacement match Valenciennes','Demain',false,false),
      ('Relancer l''équipementier — contrat J. Mensah','Lun.',false,false)`;
    await sql`INSERT INTO alerts (severity, body, meta) VALUES
      ('critical','Mandat de représentation de S. Traoré expire dans 21 jours — renouvellement à signer.','Contrats · aujourd''hui'),
      ('serious','M. Lopes : retour de blessure validé par le staff médical — reprise collective lundi.','Médical · il y a 2 h'),
      ('warning','Changement d''entraîneur à Sunderland AFC — besoins de l''effectif à réévaluer.','Veille clubs · il y a 5 h'),
      ('good','J. Mensah élu joueur du mois de Ligue 2 — momentum idéal pour le kit média.','Performance · hier')`;
    await sql`INSERT INTO events (day_label, time_label, title, location) VALUES
      ('Aujourd''hui','10:00','Appel avocat — mandat S. Traoré','Visio'),
      ('Aujourd''hui','14:30','RDV directeur sportif LOSC','Domaine de Luchin — prolongation T. Kowalski'),
      ('Demain','15:00','Match amical — Valenciennes vs Lens','Suivi K. Diarra + 2 cibles scouting'),
      ('Lundi','09:30','Reprise collective M. Lopes','Centre d''entraînement'),
      ('Lundi','18:00','Call sponsor équipementier — J. Mensah','Visio')`;
    await sql`INSERT INTO opportunities (club, fit_pct, body) VALUES
      ('RC Strasbourg',87,'Cherche un milieu box-to-box U23 · budget 8-12 M€ → profil K. Diarra'),
      ('Sunderland AFC',81,'Nouveau coach, besoin latéral gauche offensif → profil A. Bensaïd'),
      ('LOSC Lille',78,'Latéral droit blessé 8 semaines · joker médical → profil Y. Petit'),
      ('FC Utrecht',74,'Vend son n°9 en janvier · cherche un remplaçant → profil J. Mensah')`;
    await sql`INSERT INTO contacts (name, role, org, last_exchange, next_step) VALUES
      ('P. Vandermeulen','Directeur sportif','LOSC Lille','Il y a 2 j — prolongation Kowalski','RDV auj. 14:30'),
      ('C. Marchetti','Head of Recruitment','RC Strasbourg','Hier — intérêt K. Diarra','Envoyer dossier joueur'),
      ('Me A. Duret','Avocate droit du sport','Cabinet Duret','Il y a 5 j — mandat Traoré','Appel auj. 10:00'),
      ('R. Osei','Scout senior','Indépendant','Il y a 1 sem — cibles Ligue 2','Debrief samedi'),
      ('L. Björk','Sponsoring manager','Équipementier NRD','Il y a 3 j — contrat Mensah','Call lun. 18:00')`;
    console.log("→ Seed terminé.");
  }
  const counts = await sql`SELECT
    (SELECT COUNT(*)::int FROM players) AS players,
    (SELECT COUNT(*)::int FROM tasks) AS tasks,
    (SELECT COUNT(*)::int FROM contacts) AS contacts`;
  console.log("✓ Supabase prêt :", counts[0]);
} finally {
  await sql.end();
}
