import { db } from "./db";

export type Player = {
  id: number; name: string; position: string; age: number; club: string;
  contract_end: string; est_value: string; status: "ok" | "soon" | "urgent";
  status_label: string; salary: string; mandate: string; strong_foot: string;
  height: string; nationality: string; notes: string;
};
export type Task = { id: number; title: string; due_label: string; is_late: number; is_done: number };
export type Alert = { id: number; severity: "critical" | "serious" | "warning" | "good"; body: string; meta: string };
export type Event = { id: number; day_label: string; time_label: string; title: string; location: string };
export type Opportunity = { id: number; club: string; fit_pct: number; body: string };
export type Contact = { id: number; name: string; role: string; org: string; last_exchange: string; next_step: string };

export function getPlayers(): Player[] {
  return db().prepare("SELECT * FROM players ORDER BY CASE status WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, name").all() as Player[];
}
export function getPlayer(id: number): Player | undefined {
  return db().prepare("SELECT * FROM players WHERE id = ?").get(id) as Player | undefined;
}
export function getTasks(): Task[] {
  return db().prepare("SELECT * FROM tasks ORDER BY is_done, id").all() as Task[];
}
export function toggleTask(id: number): void {
  db().prepare("UPDATE tasks SET is_done = 1 - is_done WHERE id = ?").run(id);
}
export function getAlerts(): Alert[] {
  return db().prepare("SELECT * FROM alerts ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'serious' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END").all() as Alert[];
}
export function getEvents(): Event[] {
  return db().prepare("SELECT * FROM events ORDER BY id").all() as Event[];
}
export function getOpportunities(): Opportunity[] {
  return db().prepare("SELECT * FROM opportunities ORDER BY fit_pct DESC").all() as Opportunity[];
}
export function getContacts(): Contact[] {
  return db().prepare("SELECT * FROM contacts ORDER BY name").all() as Contact[];
}

export function getKpis() {
  const d = db();
  const players = (d.prepare("SELECT COUNT(*) AS n FROM players").get() as { n: number }).n;
  const expiring = (d.prepare("SELECT COUNT(*) AS n FROM players WHERE status IN ('soon','urgent')").get() as { n: number }).n;
  const events = (d.prepare("SELECT COUNT(*) AS n FROM events").get() as { n: number }).n;
  const openTasks = (d.prepare("SELECT COUNT(*) AS n FROM tasks WHERE is_done = 0").get() as { n: number }).n;
  return { players, expiring, events, openTasks };
}
