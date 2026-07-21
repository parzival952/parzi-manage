// Couche de requêtes Parzi Manage — double mode :
// - DATABASE_URL définie → Postgres/Supabase (production), données cloisonnées par user_id
// - sinon → SQLite locale (développement, mono-utilisateur, userId ignoré)
import { db } from "./db";
import { pg, usePostgres } from "./pg";

export type Player = {
  id: number; name: string; position: string; age: number; club: string;
  contract_end: string; est_value: string; status: "ok" | "soon" | "urgent";
  status_label: string; salary: string; mandate: string; strong_foot: string;
  height: string; nationality: string; notes: string; pitch?: string;
  transfermarkt_url: string;
};
export type Task = { id: number; title: string; due_label: string; is_late: boolean | number; is_done: boolean | number };
export type Alert = { id: number; severity: "critical" | "serious" | "warning" | "good"; body: string; meta: string };
export type Event = { id: number; day_label: string; time_label: string; title: string; location: string };
export type Opportunity = { id: number; club: string; fit_pct: number; body: string };
export type Contact = { id: number; name: string; role: string; org: string; last_exchange: string; next_step: string };
export type PlayerInput = Omit<Player, "id">;

// ---------- Lectures ----------

export async function getPlayers(uid: string): Promise<Player[]> {
  if (usePostgres()) {
    return (await pg()`SELECT * FROM players WHERE user_id = ${uid}
      ORDER BY CASE status WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, name`) as unknown as Player[];
  }
  return db().prepare("SELECT * FROM players ORDER BY CASE status WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, name").all() as Player[];
}

export async function getPlayer(uid: string, id: number): Promise<Player | undefined> {
  if (usePostgres()) {
    const rows = (await pg()`SELECT * FROM players WHERE id = ${id} AND user_id = ${uid}`) as unknown as Player[];
    return rows[0];
  }
  return db().prepare("SELECT * FROM players WHERE id = ?").get(id) as Player | undefined;
}

export async function getTasks(uid: string): Promise<Task[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM tasks WHERE user_id = ${uid} ORDER BY is_done, id`) as unknown as Task[];
  return db().prepare("SELECT * FROM tasks ORDER BY is_done, id").all() as Task[];
}

export async function getAlerts(uid: string): Promise<Alert[]> {
  const order = "CASE severity WHEN 'critical' THEN 0 WHEN 'serious' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END";
  if (usePostgres()) {
    return (await pg().unsafe(`SELECT * FROM alerts WHERE user_id = $1 ORDER BY ${order}`, [uid])) as unknown as Alert[];
  }
  return db().prepare(`SELECT * FROM alerts ORDER BY ${order}`).all() as Alert[];
}

export async function getEvents(uid: string): Promise<Event[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM events WHERE user_id = ${uid} ORDER BY id`) as unknown as Event[];
  return db().prepare("SELECT * FROM events ORDER BY id").all() as Event[];
}

export async function getOpportunities(uid: string): Promise<Opportunity[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM opportunities WHERE user_id = ${uid} ORDER BY fit_pct DESC`) as unknown as Opportunity[];
  return db().prepare("SELECT * FROM opportunities ORDER BY fit_pct DESC").all() as Opportunity[];
}

export async function getContacts(uid: string): Promise<Contact[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM contacts WHERE user_id = ${uid} ORDER BY name`) as unknown as Contact[];
  return db().prepare("SELECT * FROM contacts ORDER BY name").all() as Contact[];
}

export async function getKpis(uid: string) {
  if (usePostgres()) {
    const sql = pg();
    const [p, e, t, x] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM players WHERE user_id = ${uid}`,
      sql`SELECT COUNT(*)::int AS n FROM events WHERE user_id = ${uid}`,
      sql`SELECT COUNT(*)::int AS n FROM tasks WHERE user_id = ${uid} AND NOT is_done`,
      sql`SELECT COUNT(*)::int AS n FROM players WHERE user_id = ${uid} AND status IN ('soon','urgent')`,
    ]);
    return { players: p[0].n, events: e[0].n, openTasks: t[0].n, expiring: x[0].n };
  }
  const d = db();
  return {
    players: (d.prepare("SELECT COUNT(*) AS n FROM players").get() as { n: number }).n,
    expiring: (d.prepare("SELECT COUNT(*) AS n FROM players WHERE status IN ('soon','urgent')").get() as { n: number }).n,
    events: (d.prepare("SELECT COUNT(*) AS n FROM events").get() as { n: number }).n,
    openTasks: (d.prepare("SELECT COUNT(*) AS n FROM tasks WHERE is_done = 0").get() as { n: number }).n,
  };
}

// ---------- Mutations ----------

export async function createPlayer(uid: string, p: PlayerInput): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO players (user_id, name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes, transfermarkt_url)
      VALUES (${uid}, ${p.name}, ${p.position}, ${p.age}, ${p.club}, ${p.contract_end}, ${p.est_value}, ${p.status}, ${p.status_label}, ${p.salary}, ${p.mandate}, ${p.strong_foot}, ${p.height}, ${p.nationality}, ${p.notes}, ${p.transfermarkt_url})`;
    return;
  }
  db().prepare(`INSERT INTO players (name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes, transfermarkt_url)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(p.name, p.position, p.age, p.club, p.contract_end, p.est_value, p.status, p.status_label, p.salary, p.mandate, p.strong_foot, p.height, p.nationality, p.notes, p.transfermarkt_url);
}

export async function updatePlayer(uid: string, id: number, p: PlayerInput): Promise<void> {
  if (usePostgres()) {
    await pg()`UPDATE players SET name=${p.name}, position=${p.position}, age=${p.age}, club=${p.club},
      contract_end=${p.contract_end}, est_value=${p.est_value}, status=${p.status}, status_label=${p.status_label},
      salary=${p.salary}, mandate=${p.mandate}, strong_foot=${p.strong_foot}, height=${p.height},
      nationality=${p.nationality}, notes=${p.notes}, transfermarkt_url=${p.transfermarkt_url} WHERE id=${id} AND user_id=${uid}`;
    return;
  }
  db().prepare(`UPDATE players SET name=?, position=?, age=?, club=?, contract_end=?, est_value=?, status=?, status_label=?,
    salary=?, mandate=?, strong_foot=?, height=?, nationality=?, notes=?, transfermarkt_url=? WHERE id=?`)
    .run(p.name, p.position, p.age, p.club, p.contract_end, p.est_value, p.status, p.status_label, p.salary, p.mandate, p.strong_foot, p.height, p.nationality, p.notes, p.transfermarkt_url, id);
}

export async function deletePlayer(uid: string, id: number): Promise<void> {
  if (usePostgres()) { await pg()`DELETE FROM players WHERE id=${id} AND user_id=${uid}`; return; }
  db().prepare("DELETE FROM players WHERE id=?").run(id);
}

export async function toggleTask(uid: string, id: number): Promise<void> {
  if (usePostgres()) { await pg()`UPDATE tasks SET is_done = NOT is_done WHERE id = ${id} AND user_id = ${uid}`; return; }
  db().prepare("UPDATE tasks SET is_done = 1 - is_done WHERE id = ?").run(id);
}

export async function createTask(uid: string, title: string, due_label: string): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO tasks (user_id, title, due_label, is_late, is_done) VALUES (${uid}, ${title}, ${due_label}, false, false)`;
    return;
  }
  db().prepare("INSERT INTO tasks (title, due_label, is_late, is_done) VALUES (?,?,0,0)").run(title, due_label);
}

export async function createContact(uid: string, c: Omit<Contact, "id">): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO contacts (user_id, name, role, org, last_exchange, next_step)
      VALUES (${uid}, ${c.name}, ${c.role}, ${c.org}, ${c.last_exchange}, ${c.next_step})`;
    return;
  }
  db().prepare("INSERT INTO contacts (name, role, org, last_exchange, next_step) VALUES (?,?,?,?,?)")
    .run(c.name, c.role, c.org, c.last_exchange, c.next_step);
}

// ---------- Clubs ----------

export type Club = { id: number; name: string; league: string; need: string; budget: string; contact_name: string; notes: string };

export async function getClubs(uid: string): Promise<Club[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM clubs WHERE user_id = ${uid} ORDER BY name`) as unknown as Club[];
  return db().prepare("SELECT * FROM clubs ORDER BY name").all() as Club[];
}

export async function createClub(uid: string, c: Omit<Club, "id">): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO clubs (user_id, name, league, need, budget, contact_name, notes)
      VALUES (${uid}, ${c.name}, ${c.league}, ${c.need}, ${c.budget}, ${c.contact_name}, ${c.notes})`;
    return;
  }
  db().prepare("INSERT INTO clubs (name, league, need, budget, contact_name, notes) VALUES (?,?,?,?,?,?)")
    .run(c.name, c.league, c.need, c.budget, c.contact_name, c.notes);
}

export async function deleteClub(uid: string, id: number): Promise<void> {
  if (usePostgres()) { await pg()`DELETE FROM clubs WHERE id=${id} AND user_id=${uid}`; return; }
  db().prepare("DELETE FROM clubs WHERE id=?").run(id);
}

// ---------- Scouting (cibles) ----------

export type Prospect = { id: number; name: string; position: string; age: number; club: string; league: string; contract_end: string; note: string };

export async function getProspects(uid: string): Promise<Prospect[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM prospects WHERE user_id = ${uid} ORDER BY name`) as unknown as Prospect[];
  return db().prepare("SELECT * FROM prospects ORDER BY name").all() as Prospect[];
}

export async function createProspect(uid: string, p: Omit<Prospect, "id">): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO prospects (user_id, name, position, age, club, league, contract_end, note)
      VALUES (${uid}, ${p.name}, ${p.position}, ${p.age}, ${p.club}, ${p.league}, ${p.contract_end}, ${p.note})`;
    return;
  }
  db().prepare("INSERT INTO prospects (name, position, age, club, league, contract_end, note) VALUES (?,?,?,?,?,?,?)")
    .run(p.name, p.position, p.age, p.club, p.league, p.contract_end, p.note);
}

export async function deleteProspect(uid: string, id: number): Promise<void> {
  if (usePostgres()) { await pg()`DELETE FROM prospects WHERE id=${id} AND user_id=${uid}`; return; }
  db().prepare("DELETE FROM prospects WHERE id=?").run(id);
}

// ---------- Événements (calendrier) ----------

export async function createEvent(uid: string, e: Omit<Event, "id">): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO events (user_id, day_label, time_label, title, location)
      VALUES (${uid}, ${e.day_label}, ${e.time_label}, ${e.title}, ${e.location})`;
    return;
  }
  db().prepare("INSERT INTO events (day_label, time_label, title, location) VALUES (?,?,?,?)")
    .run(e.day_label, e.time_label, e.title, e.location);
}

export async function deleteEvent(uid: string, id: number): Promise<void> {
  if (usePostgres()) { await pg()`DELETE FROM events WHERE id=${id} AND user_id=${uid}`; return; }
  db().prepare("DELETE FROM events WHERE id=?").run(id);
}

// ---------- Profils (e-mail + préférences de notification) ----------

/** Statut de vérification agent — première brique de Parzi ID (identité vérifiée). */
export type AgentStatus = "none" | "pending" | "verified" | "rejected";

export type Profile = {
  user_id: string; email: string; notify_brief: boolean | number; last_brief_sent: string | null; path: string;
  agent_status: AgentStatus; full_name: string; license_number: string; license_country: string;
  license_submitted_at: string; verified_at: string; verify_note: string;
};

export async function getProfile(uid: string): Promise<Profile | undefined> {
  if (usePostgres()) {
    const rows = (await pg()`SELECT * FROM profiles WHERE user_id = ${uid}`) as unknown as Profile[];
    return rows[0];
  }
  return db().prepare("SELECT * FROM profiles WHERE user_id = ?").get(uid) as Profile | undefined;
}

/** Mémorise l'e-mail du compte (appelé à chaque connexion/inscription). */
export async function upsertProfile(uid: string, email: string): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO profiles (user_id, email) VALUES (${uid}, ${email})
      ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email`;
    return;
  }
  db().prepare(`INSERT INTO profiles (user_id, email) VALUES (?,?)
    ON CONFLICT (user_id) DO UPDATE SET email = excluded.email`).run(uid, email);
}

/** Parcours choisi à l'inscription : 'aspirant' (Academy) ou 'agent' (Manage). */
export async function setPath(uid: string, path: "aspirant" | "agent"): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO profiles (user_id, path) VALUES (${uid}, ${path})
      ON CONFLICT (user_id) DO UPDATE SET path = ${path}`;
    return;
  }
  db().prepare(`INSERT INTO profiles (user_id, path) VALUES (?,?)
    ON CONFLICT(user_id) DO UPDATE SET path = excluded.path`).run(uid, path);
}

export async function setNotifyBrief(uid: string, on: boolean): Promise<void> {
  if (usePostgres()) { await pg()`UPDATE profiles SET notify_brief = ${on} WHERE user_id = ${uid}`; return; }
  db().prepare("UPDATE profiles SET notify_brief = ? WHERE user_id = ?").run(on ? 1 : 0, uid);
}

export async function markBriefSent(uid: string, date: string): Promise<void> {
  if (usePostgres()) { await pg()`UPDATE profiles SET last_brief_sent = ${date} WHERE user_id = ${uid}`; return; }
  db().prepare("UPDATE profiles SET last_brief_sent = ? WHERE user_id = ?").run(date, uid);
}

/** Profils à notifier aujourd'hui (opt-in, e-mail connu, pas encore envoyé ce jour). */
export async function getNotifiableProfiles(date: string): Promise<Profile[]> {
  if (usePostgres()) {
    return (await pg()`SELECT * FROM profiles
      WHERE notify_brief AND email <> '' AND (last_brief_sent IS NULL OR last_brief_sent <> ${date}::date)
      LIMIT 100`) as unknown as Profile[];
  }
  return db().prepare("SELECT * FROM profiles WHERE notify_brief = 1 AND email <> '' AND last_brief_sent <> ?").all(date) as Profile[];
}

// ---------- Vérification agent (Parzi ID — accès aux fonctions de contact) ----------

/** L'agent soumet son n° de licence FFF/FIFA → passe en attente de validation. */
export async function submitLicense(
  uid: string,
  data: { full_name: string; license_number: string; license_country: string },
): Promise<void> {
  const now = new Date().toISOString();
  const { full_name, license_number, license_country } = data;
  if (usePostgres()) {
    await pg()`INSERT INTO profiles (user_id, agent_status, full_name, license_number, license_country, license_submitted_at, verify_note)
      VALUES (${uid}, 'pending', ${full_name}, ${license_number}, ${license_country}, ${now}, '')
      ON CONFLICT (user_id) DO UPDATE SET
        agent_status = 'pending', full_name = ${full_name}, license_number = ${license_number},
        license_country = ${license_country}, license_submitted_at = ${now}, verify_note = ''`;
    return;
  }
  db().prepare(`INSERT INTO profiles (user_id, agent_status, full_name, license_number, license_country, license_submitted_at, verify_note)
    VALUES (?, 'pending', ?, ?, ?, ?, '')
    ON CONFLICT(user_id) DO UPDATE SET
      agent_status = 'pending', full_name = excluded.full_name, license_number = excluded.license_number,
      license_country = excluded.license_country, license_submitted_at = excluded.license_submitted_at, verify_note = ''`)
    .run(uid, full_name, license_number, license_country, now);
}

/** Décision de l'admin : valide, refuse (avec motif) ou remet à zéro un dossier. */
export async function setAgentStatus(uid: string, status: AgentStatus, note = ""): Promise<void> {
  const verifiedAt = status === "verified" ? new Date().toISOString() : "";
  if (usePostgres()) {
    await pg()`UPDATE profiles SET agent_status = ${status}, verified_at = ${verifiedAt}, verify_note = ${note} WHERE user_id = ${uid}`;
    return;
  }
  db().prepare("UPDATE profiles SET agent_status = ?, verified_at = ?, verify_note = ? WHERE user_id = ?")
    .run(status, verifiedAt, note, uid);
}

/** Dossiers de vérification pour la console admin (les « pending » d'abord, puis traités). */
export async function listVerifications(): Promise<Profile[]> {
  if (usePostgres()) {
    return (await pg()`SELECT * FROM profiles
      WHERE agent_status <> 'none' OR license_number <> ''
      ORDER BY CASE agent_status WHEN 'pending' THEN 0 WHEN 'verified' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END,
        license_submitted_at DESC
      LIMIT 200`) as unknown as Profile[];
  }
  return db().prepare(`SELECT * FROM profiles
    WHERE agent_status <> 'none' OR license_number <> ''
    ORDER BY CASE agent_status WHEN 'pending' THEN 0 WHEN 'verified' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END,
      license_submitted_at DESC
    LIMIT 200`).all() as Profile[];
}

// ---------- Seed du portefeuille de démonstration pour un nouveau compte ----------

export async function ensureSeeded(uid: string): Promise<void> {
  if (!usePostgres()) return; // en dev SQLite, le seed est géré par db.ts
  const sql = pg();
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM players WHERE user_id = ${uid}`;
  if (n > 0) return;
  await sql`INSERT INTO players (user_id, name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes) VALUES
    (${uid},'K. Diarra (démo)','Milieu central',21,'Valenciennes FC','Juin 2027','6,5 M€','soon','Contrat < 12 mois','28 K€/mois','Exclusif · exp. 03/2027','Droit','1,84 m','France / Mali','Joueur de démonstration — supprime-le et ajoute tes vrais joueurs. Intérêt concret du RC Strasbourg.'),
    (${uid},'S. Traoré (démo)','Attaquant',19,'AS Nancy (centre)','Juin 2027','1,5 M€','urgent','Mandat exp. 21 j','6 K€/mois','Exclusif · exp. 08/2026 ⚠','Droit','1,86 m','France / Côte d''Ivoire','Joueur de démonstration — exemple d''alerte de mandat qui expire.'),
    (${uid},'J. Mensah (démo)','Avant-centre',22,'Rodez AF','Juin 2028','5,0 M€','ok','Sous contrat','24 K€/mois','Exclusif · exp. 05/2027','Droit','1,88 m','Ghana','Joueur de démonstration — joueur du mois L2, intérêt du FC Utrecht.')`;
  await sql`INSERT INTO tasks (user_id, title, due_label, is_late, is_done) VALUES
    (${uid},'Découvrir Parzi Manage 👋','Auj.',false,false),
    (${uid},'Ajouter mon premier vrai joueur','Cette sem.',false,false),
    (${uid},'Compléter mes contacts clubs','Cette sem.',false,false)`;
  await sql`INSERT INTO alerts (user_id, severity, body, meta) VALUES
    (${uid},'critical','Mandat de S. Traoré (démo) expire dans 21 jours — exemple d''alerte automatique.','Contrats · démo'),
    (${uid},'good','Bienvenue sur Parzi Manage ! Ajoute tes joueurs et le dashboard prendra vie.','Parzi Manage')`;
  await sql`INSERT INTO events (user_id, day_label, time_label, title, location) VALUES
    (${uid},'Aujourd''hui','—','Prendre en main Parzi Manage','10 minutes suffisent'),
    (${uid},'Cette semaine','—','Saisir mon portefeuille réel','Joueurs → + Ajouter un joueur')`;
  await sql`INSERT INTO opportunities (user_id, club, fit_pct, body) VALUES
    (${uid},'RC Strasbourg',87,'Exemple : cherche un milieu box-to-box U23 → profil K. Diarra (démo)'),
    (${uid},'FC Utrecht',74,'Exemple : cherche un avant-centre en janvier → profil J. Mensah (démo)')`;
  await sql`INSERT INTO contacts (user_id, name, role, org, last_exchange, next_step) VALUES
    (${uid},'C. Marchetti (démo)','Head of Recruitment','RC Strasbourg','Exemple de contact','À personnaliser'),
    (${uid},'Me A. Duret (démo)','Avocate droit du sport','Cabinet Duret','Exemple de contact','À personnaliser')`;
}
