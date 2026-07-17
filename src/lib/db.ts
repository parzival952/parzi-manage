// Couche de données Parzi Manage — SQLite (node:sqlite) en dev.
// Le schéma est écrit pour être portable vers Postgres/Supabase en production
// (types simples, snake_case, pas de spécificités SQLite).
// Import de TYPE uniquement (effacé à la compilation) : le module node:sqlite
// n'est chargé qu'à l'exécution, et seulement si le mode SQLite est utilisé —
// jamais en production Vercel (où DATABASE_URL est définie).
import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "parzi.db");

let _db: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (_db) return _db;
  const sqlite = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
  fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new sqlite.DatabaseSync(DB_PATH);
  _db.exec("PRAGMA journal_mode = WAL;");
  migrate(_db);
  seedIfEmpty(_db);
  return _db;
}

function migrate(d: DatabaseSync) {
  d.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    age INTEGER NOT NULL,
    club TEXT NOT NULL,
    contract_end TEXT NOT NULL,
    est_value TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ok','soon','urgent')),
    status_label TEXT NOT NULL,
    salary TEXT NOT NULL,
    mandate TEXT NOT NULL,
    strong_foot TEXT NOT NULL,
    height TEXT NOT NULL,
    nationality TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_label TEXT NOT NULL,
    is_late INTEGER NOT NULL DEFAULT 0,
    is_done INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    severity TEXT NOT NULL CHECK (severity IN ('critical','serious','warning','good')),
    body TEXT NOT NULL,
    meta TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_label TEXT NOT NULL,
    time_label TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    club TEXT NOT NULL,
    fit_pct INTEGER NOT NULL,
    body TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    org TEXT NOT NULL,
    last_exchange TEXT NOT NULL DEFAULT '',
    next_step TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    league TEXT NOT NULL DEFAULT '',
    need TEXT NOT NULL DEFAULT '',
    budget TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    sport TEXT NOT NULL DEFAULT 'football'
  );
  CREATE TABLE IF NOT EXISTS prospects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT '',
    age INTEGER NOT NULL DEFAULT 18,
    club TEXT NOT NULL DEFAULT '',
    league TEXT NOT NULL DEFAULT '',
    contract_end TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    sport TEXT NOT NULL DEFAULT 'football'
  );
  CREATE TABLE IF NOT EXISTS ai_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS daily_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brief_date TEXT NOT NULL,
    content TEXT NOT NULL
  );
  `);
}

function seedIfEmpty(d: DatabaseSync) {
  const row = d.prepare("SELECT COUNT(*) AS n FROM players").get() as { n: number };
  if (row.n > 0) return;

  const insP = d.prepare(`INSERT INTO players
    (name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const players: [string, string, number, string, string, string, string, string, string, string, string, string, string, string][] = [
    ["K. Diarra", "Milieu central", 21, "Valenciennes FC", "Juin 2027", "6,5 M€", "soon", "Contrat < 12 mois", "28 K€/mois", "Exclusif · exp. 03/2027", "Droit", "1,84 m", "France / Mali", "Intérêt concret du RC Strasbourg. Ouvrir la négociation avant le mercato d'hiver."],
    ["M. Lopes", "Ailier droit", 23, "FC Famalicão (prêt)", "Juin 2028", "4,2 M€", "ok", "Sous contrat", "22 K€/mois", "Co-mandat DF Sports · exp. 09/2027", "Gauche", "1,76 m", "Portugal", "Retour de blessure validé. Reprise collective lundi — point médical à prévoir."],
    ["A. Bensaïd", "Latéral gauche", 24, "SM Caen", "Juin 2027", "3,8 M€", "soon", "Contrat < 12 mois", "19 K€/mois", "Exclusif · exp. 01/2028", "Gauche", "1,79 m", "France / Maroc", "Profil piston — compatible avec le nouveau système de Sunderland."],
    ["T. Kowalski", "Défenseur central", 26, "LOSC Lille", "Juin 2029", "12,0 M€", "ok", "Prolongation en cours", "65 K€/mois", "Exclusif · exp. 06/2028", "Droit", "1,91 m", "Pologne", "Cible : +40 % salaire, clause de départ 25 M€."],
    ["S. Traoré", "Attaquant", 19, "AS Nancy (centre)", "Juin 2027", "1,5 M€", "urgent", "Mandat exp. 21 j", "6 K€/mois", "Exclusif · exp. 08/2026 ⚠", "Droit", "1,86 m", "France / Côte d'Ivoire", "PRIORITÉ : renouvellement du mandat sous 21 jours."],
    ["J. Mensah", "Avant-centre", 22, "Rodez AF", "Juin 2028", "5,0 M€", "ok", "Sous contrat", "24 K€/mois", "Exclusif · exp. 05/2027", "Droit", "1,88 m", "Ghana", "Joueur du mois L2. Intérêt du FC Utrecht."],
    ["L. Fernandes", "Milieu offensif", 20, "Grenoble Foot 38", "Juin 2029", "2,8 M€", "ok", "Sous contrat", "14 K€/mois", "Exclusif · exp. 11/2027", "Gauche", "1,74 m", "France / Portugal", "Progression régulière. Revalorisation été 2027."],
    ["Y. Petit", "Latéral droit", 25, "Paris FC", "Juin 2027", "3,2 M€", "soon", "Contrat < 12 mois", "21 K€/mois", "Exclusif · exp. 04/2027", "Droit", "1,81 m", "France", "Opportunité LOSC (joker médical)."],
    ["E. Okafor", "Gardien", 27, "USL Dunkerque", "Juin 2028", "1,8 M€", "ok", "Sous contrat", "16 K€/mois", "Exclusif · exp. 02/2028", "Droit", "1,93 m", "Nigeria", "Saison solide. Cible haut de tableau L2 été 2027."],
    ["R. Duval", "Milieu défensif", 18, "FC Metz (U19)", "Aspirant", "—", "ok", "Jeune — 1er pro visé", "—", "Exclusif · exp. 07/2028", "Droit", "1,82 m", "France", "Objectif : premier contrat pro à Metz cet hiver."],
    ["N. Haddad", "Ailier gauche", 22, "Clermont Foot", "Juin 2028", "3,5 M€", "ok", "Sous contrat", "18 K€/mois", "Exclusif · exp. 10/2027", "Droit", "1,77 m", "France / Tunisie", "Deux sélections espoirs — visibilité en hausse."],
    ["P. Sørensen", "Défenseur central", 24, "Amiens SC", "Juin 2027", "2,6 M€", "soon", "Contrat < 12 mois", "17 K€/mois", "Exclusif · exp. 12/2027", "Gauche", "1,90 m", "Danemark", "Gaucher recherché. Marchés scandinave et belge à sonder."],
  ];
  for (const p of players) insP.run(...p);

  const insT = d.prepare("INSERT INTO tasks (title, due_label, is_late, is_done) VALUES (?,?,?,?)");
  ([
    ["Envoyer le renouvellement de mandat à S. Traoré", "Auj.", 1, 0],
    ["Finaliser le benchmark salarial T. Kowalski", "Auj. 13h", 0, 1],
    ["Dossier joueur K. Diarra → RC Strasbourg", "Demain", 0, 0],
    ["Réserver le déplacement match Valenciennes", "Demain", 0, 0],
    ["Relancer l'équipementier — contrat J. Mensah", "Lun.", 0, 0],
  ] as [string, string, number, number][]).forEach((t) => insT.run(...t));

  const insA = d.prepare("INSERT INTO alerts (severity, body, meta) VALUES (?,?,?)");
  ([
    ["critical", "Mandat de représentation de S. Traoré expire dans 21 jours — renouvellement à signer.", "Contrats · aujourd'hui"],
    ["serious", "M. Lopes : retour de blessure validé par le staff médical — reprise collective lundi.", "Médical · il y a 2 h"],
    ["warning", "Changement d'entraîneur à Sunderland AFC — besoins de l'effectif à réévaluer.", "Veille clubs · il y a 5 h"],
    ["good", "J. Mensah élu joueur du mois de Ligue 2 — momentum idéal pour le kit média.", "Performance · hier"],
  ] as [string, string, string][]).forEach((a) => insA.run(...a));

  const insE = d.prepare("INSERT INTO events (day_label, time_label, title, location) VALUES (?,?,?,?)");
  ([
    ["Aujourd'hui", "10:00", "Appel avocat — mandat S. Traoré", "Visio"],
    ["Aujourd'hui", "14:30", "RDV directeur sportif LOSC", "Domaine de Luchin — prolongation T. Kowalski"],
    ["Demain", "15:00", "Match amical — Valenciennes vs Lens", "Suivi K. Diarra + 2 cibles scouting"],
    ["Lundi", "09:30", "Reprise collective M. Lopes", "Centre d'entraînement"],
    ["Lundi", "18:00", "Call sponsor équipementier — J. Mensah", "Visio"],
  ] as [string, string, string, string][]).forEach((e) => insE.run(...e));

  const insO = d.prepare("INSERT INTO opportunities (club, fit_pct, body) VALUES (?,?,?)");
  ([
    ["RC Strasbourg", 87, "Cherche un milieu box-to-box U23 · budget 8-12 M€ → profil K. Diarra"],
    ["Sunderland AFC", 81, "Nouveau coach, besoin latéral gauche offensif → profil A. Bensaïd"],
    ["LOSC Lille", 78, "Latéral droit blessé 8 semaines · joker médical → profil Y. Petit"],
    ["FC Utrecht", 74, "Vend son n°9 en janvier · cherche un remplaçant → profil J. Mensah"],
  ] as [string, number, string][]).forEach((o) => insO.run(...o));

  const insC = d.prepare("INSERT INTO contacts (name, role, org, last_exchange, next_step) VALUES (?,?,?,?,?)");
  ([
    ["P. Vandermeulen", "Directeur sportif", "LOSC Lille", "Il y a 2 j — prolongation Kowalski", "RDV auj. 14:30"],
    ["C. Marchetti", "Head of Recruitment", "RC Strasbourg", "Hier — intérêt K. Diarra", "Envoyer dossier joueur"],
    ["Me A. Duret", "Avocate droit du sport", "Cabinet Duret", "Il y a 5 j — mandat Traoré", "Appel auj. 10:00"],
    ["R. Osei", "Scout senior", "Indépendant", "Il y a 1 sem — cibles Ligue 2", "Debrief samedi"],
    ["L. Björk", "Sponsoring manager", "Équipementier NRD", "Il y a 3 j — contrat Mensah", "Call lun. 18:00"],
  ] as [string, string, string, string, string][]).forEach((c) => insC.run(...c));
}
