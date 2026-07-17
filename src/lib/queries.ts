// Couche de requêtes Parzi Manage — double mode :
// - DATABASE_URL définie → Postgres/Supabase (production)
// - sinon → SQLite locale (développement, zéro configuration)
import { db } from "./db";
import { pg, usePostgres } from "./pg";

export type Player = {
  id: number; name: string; position: string; age: number; club: string;
  contract_end: string; est_value: string; status: "ok" | "soon" | "urgent";
  status_label: string; salary: string; mandate: string; strong_foot: string;
  height: string; nationality: string; notes: string;
};
export type Task = { id: number; title: string; due_label: string; is_late: boolean | number; is_done: boolean | number };
export type Alert = { id: number; severity: "critical" | "serious" | "warning" | "good"; body: string; meta: string };
export type Event = { id: number; day_label: string; time_label: string; title: string; location: string };
export type Opportunity = { id: number; club: string; fit_pct: number; body: string };
export type Contact = { id: number; name: string; role: string; org: string; last_exchange: string; next_step: string };

export async function getPlayers(): Promise<Player[]> {
  if (usePostgres()) {
    return (await pg()`SELECT * FROM players ORDER BY CASE status WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, name`) as unknown as Player[];
  }
  return db().prepare("SELECT * FROM players ORDER BY CASE status WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, name").all() as Player[];
}

export async function getPlayer(id: number): Promise<Player | undefined> {
  if (usePostgres()) {
    const rows = (await pg()`SELECT * FROM players WHERE id = ${id}`) as unknown as Player[];
    return rows[0];
  }
  return db().prepare("SELECT * FROM players WHERE id = ?").get(id) as Player | undefined;
}

export async function getTasks(): Promise<Task[]> {
  if (usePostgres()) {
    return (await pg()`SELECT * FROM tasks ORDER BY is_done, id`) as unknown as Task[];
  }
  return db().prepare("SELECT * FROM tasks ORDER BY is_done, id").all() as Task[];
}

export async function toggleTask(id: number): Promise<void> {
  if (usePostgres()) {
    await pg()`UPDATE tasks SET is_done = NOT is_done WHERE id = ${id}`;
    return;
  }
  db().prepare("UPDATE tasks SET is_done = 1 - is_done WHERE id = ?").run(id);
}

export async function getAlerts(): Promise<Alert[]> {
  const order = "CASE severity WHEN 'critical' THEN 0 WHEN 'serious' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END";
  if (usePostgres()) {
    return (await pg().unsafe(`SELECT * FROM alerts ORDER BY ${order}`)) as unknown as Alert[];
  }
  return db().prepare(`SELECT * FROM alerts ORDER BY ${order}`).all() as Alert[];
}

export async function getEvents(): Promise<Event[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM events ORDER BY id`) as unknown as Event[];
  return db().prepare("SELECT * FROM events ORDER BY id").all() as Event[];
}

export async function getOpportunities(): Promise<Opportunity[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM opportunities ORDER BY fit_pct DESC`) as unknown as Opportunity[];
  return db().prepare("SELECT * FROM opportunities ORDER BY fit_pct DESC").all() as Opportunity[];
}

export async function getContacts(): Promise<Contact[]> {
  if (usePostgres()) return (await pg()`SELECT * FROM contacts ORDER BY name`) as unknown as Contact[];
  return db().prepare("SELECT * FROM contacts ORDER BY name").all() as Contact[];
}

// ---------- Mutations ----------

export type PlayerInput = Omit<Player, "id">;

export async function createPlayer(p: PlayerInput): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO players (name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes)
      VALUES (${p.name}, ${p.position}, ${p.age}, ${p.club}, ${p.contract_end}, ${p.est_value}, ${p.status}, ${p.status_label}, ${p.salary}, ${p.mandate}, ${p.strong_foot}, ${p.height}, ${p.nationality}, ${p.notes})`;
    return;
  }
  db().prepare(`INSERT INTO players (name, position, age, club, contract_end, est_value, status, status_label, salary, mandate, strong_foot, height, nationality, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(p.name, p.position, p.age, p.club, p.contract_end, p.est_value, p.status, p.status_label, p.salary, p.mandate, p.strong_foot, p.height, p.nationality, p.notes);
}

export async function updatePlayer(id: number, p: PlayerInput): Promise<void> {
  if (usePostgres()) {
    await pg()`UPDATE players SET name=${p.name}, position=${p.position}, age=${p.age}, club=${p.club},
      contract_end=${p.contract_end}, est_value=${p.est_value}, status=${p.status}, status_label=${p.status_label},
      salary=${p.salary}, mandate=${p.mandate}, strong_foot=${p.strong_foot}, height=${p.height},
      nationality=${p.nationality}, notes=${p.notes} WHERE id=${id}`;
    return;
  }
  db().prepare(`UPDATE players SET name=?, position=?, age=?, club=?, contract_end=?, est_value=?, status=?, status_label=?,
    salary=?, mandate=?, strong_foot=?, height=?, nationality=?, notes=? WHERE id=?`)
    .run(p.name, p.position, p.age, p.club, p.contract_end, p.est_value, p.status, p.status_label, p.salary, p.mandate, p.strong_foot, p.height, p.nationality, p.notes, id);
}

export async function deletePlayer(id: number): Promise<void> {
  if (usePostgres()) {
    await pg()`DELETE FROM players WHERE id=${id}`;
    return;
  }
  db().prepare("DELETE FROM players WHERE id=?").run(id);
}

export async function createTask(title: string, due_label: string): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO tasks (title, due_label, is_late, is_done) VALUES (${title}, ${due_label}, false, false)`;
    return;
  }
  db().prepare("INSERT INTO tasks (title, due_label, is_late, is_done) VALUES (?,?,0,0)").run(title, due_label);
}

export async function createContact(c: Omit<Contact, "id">): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO contacts (name, role, org, last_exchange, next_step)
      VALUES (${c.name}, ${c.role}, ${c.org}, ${c.last_exchange}, ${c.next_step})`;
    return;
  }
  db().prepare("INSERT INTO contacts (name, role, org, last_exchange, next_step) VALUES (?,?,?,?,?)")
    .run(c.name, c.role, c.org, c.last_exchange, c.next_step);
}

export async function getKpis() {
  if (usePostgres()) {
    const sql = pg();
    const [p, e, t, x] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM players`,
      sql`SELECT COUNT(*)::int AS n FROM events`,
      sql`SELECT COUNT(*)::int AS n FROM tasks WHERE NOT is_done`,
      sql`SELECT COUNT(*)::int AS n FROM players WHERE status IN ('soon','urgent')`,
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
