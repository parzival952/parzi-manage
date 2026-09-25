export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { labelOf, listInscrits, syntheseInscrits, type Repartition } from "@/lib/academy-admin";
import { AGE_RANGES, EXAM_HORIZONS, GOALS, REFERRAL_SOURCES } from "@/lib/academy-onboarding-fields";
import { requireAdminRole } from "@/lib/authorization";

export const metadata: Metadata = { title: "Inscrits", robots: { index: false, follow: false } };

// Tableau de bord des inscrits PARZI Academy, réservé à l'admin (page
// introuvable pour tout autre compte). Données personnelles : ne pas partager
// de capture d'écran de cette page.
export default async function AdminInscritsPage() {
  await requireAdminRole();
  const rows = await listInscrits();
  const s = syntheseInscrits(rows, new Date());
  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
  const date = (d: string | Date | null) => {
    if (!d) return "—";
    const t = new Date(d);
    return Number.isNaN(t.getTime()) ? "—" : fmt.format(t);
  };
  const pct = (n: number) => (s.total ? `${Math.round((n / s.total) * 100)} %` : "—");

  return (
    <div className="pz-wide flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
            ADMIN · DONNÉES PERSONNELLES
          </div>
          <h1 className="text-[24px] font-black tracking-tight mt-1">Inscrits PARZI Academy</h1>
          <p className="text-[13px] pz-muted mt-1">Réservé à l&apos;administrateur. Ne partage pas de capture de cette page.</p>
        </div>
        <a href="/api/academy/admin/inscrits" className="pz-btn" style={{ padding: "10px 14px" }} download>
          Exporter en CSV
        </a>
      </header>

      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4" aria-label="Chiffres clés">
        <Tile label="Inscrits" value={String(s.total)} />
        <Tile label="Inscription terminée" value={String(s.termine)} sub={pct(s.termine)} />
        <Tile label="Actifs ces 7 jours" value={String(s.actifs7j)} sub={pct(s.actifs7j)} />
        <Tile label="Leçons validées" value={String(s.lecons)} />
      </section>

      <section className="pz-card p-5">
        <h2 className="text-[16px] font-extrabold">Parcours d&apos;inscription</h2>
        <p className="text-[12.5px] pz-muted mt-0.5 mb-4">Où les inscrits s&apos;arrêtent dans « Faisons connaissance ».</p>
        <Bars
          total={s.total}
          rows={[
            { label: "Compte créé", count: s.total },
            { label: "Étape 1 · identité", count: s.profilCommence },
            { label: "Étape 2 · projet", count: s.projetRenseigne },
            { label: "Terminé", count: s.termine },
          ]}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Breakdown titre="Objectif" rows={s.objectif} total={s.total} />
        <Breakdown titre="Échéance de l'examen" rows={s.echeance} total={s.total} />
        <Breakdown titre="Comment ils nous ont connus" rows={s.source} total={s.total} />
        <Breakdown titre="Âge" rows={s.age} total={s.total} />
        <Breakdown titre="Pays" rows={s.pays} total={s.total} />
      </div>

      <section className="pz-card p-5">
        <h2 className="text-[16px] font-extrabold mb-3">Liste des inscrits ({s.total})</h2>
        {rows.length === 0 ? (
          <p className="text-[13px] pz-muted">Aucun inscrit pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-[12.5px] border-collapse min-w-[980px]">
              <thead>
                <tr className="text-left pz-muted">
                  {["Nom", "E-mail", "Âge", "Pays / ville", "Objectif", "Examen", "Source", "Téléphone", "XP", "Leçons", "Inscrit le", "Dernière activité"].map((h) => (
                    <th key={h} className="font-bold py-2 pr-3 whitespace-nowrap" style={{ borderBottom: "1px solid var(--ligne)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.user_id} style={{ borderBottom: "1px solid var(--ligne)" }}>
                    <td className="py-2 pr-3 whitespace-nowrap font-bold text-white">
                      {r.first_name ? `${r.first_name} ${r.last_name ?? ""}` : <span className="pz-muted font-normal">Profil non rempli</span>}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{r.email || "—"}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{labelOf(AGE_RANGES, r.age_range)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {r.country ?? "—"}
                      {r.region ? ` · ${r.region}` : ""}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{labelOf(GOALS, r.goal)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{labelOf(EXAM_HORIZONS, r.exam_horizon)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{labelOf(REFERRAL_SOURCES, r.referral_source)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{r.phone || "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.xp}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.lessons}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{date(r.created_at)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{date(r.last_active)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="pz-card px-4 py-3.5">
      <div className="text-[12px] pz-muted">{label}</div>
      <div className="text-[26px] font-black tabular-nums mt-0.5 text-white">{value}</div>
      {sub ? <div className="text-[12px] pz-muted tabular-nums">{sub}</div> : null}
    </div>
  );
}

function Breakdown({ titre, rows, total }: { titre: string; rows: Repartition; total: number }) {
  return (
    <section className="pz-card p-5">
      <h2 className="text-[16px] font-extrabold mb-4">{titre}</h2>
      {rows.length ? <Bars rows={rows} total={total} /> : <p className="text-[13px] pz-muted">Pas encore de réponse.</p>}
    </section>
  );
}

// Barres horizontales, une seule teinte (quantité), valeur écrite en texte.
function Bars({ rows, total }: { rows: Repartition; total: number }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const share = total ? Math.round((r.count / total) * 100) : 0;
        return (
          <li key={r.label} title={`${r.label} : ${r.count} (${share} %)`}>
            <div className="flex justify-between gap-3 text-[12.5px] mb-1">
              <span style={{ color: "var(--texte-2)" }}>{r.label}</span>
              <span className="tabular-nums text-white font-bold">
                {r.count}
                <span className="pz-muted font-normal"> · {share} %</span>
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(var(--ink-rgb),.06)" }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${(r.count / max) * 100}%`, minWidth: r.count ? 4 : 0, background: "var(--rouge)" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
