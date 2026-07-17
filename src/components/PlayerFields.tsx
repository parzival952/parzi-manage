import type { Player } from "@/lib/queries";

const POSITIONS = [
  "Gardien", "Défenseur central", "Latéral droit", "Latéral gauche",
  "Milieu défensif", "Milieu central", "Milieu offensif",
  "Ailier droit", "Ailier gauche", "Avant-centre", "Attaquant",
];

const input =
  "w-full border border-black/15 rounded-lg px-3 py-2 text-[13.5px] bg-[#f9fafb] focus:outline-none focus:border-[#2a78d6]";
const label = "block text-[11px] font-semibold uppercase tracking-wide text-[#898781] mb-1 mt-3";

export function PlayerFields({ p }: { p?: Player }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <label className={label}>Nom *</label>
          <input name="name" required defaultValue={p?.name} placeholder="K. Diarra" className={input} />
        </div>
        <div>
          <label className={label}>Poste *</label>
          <select name="position" required defaultValue={p?.position ?? "Milieu central"} className={input}>
            {POSITIONS.map((pos) => <option key={pos}>{pos}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Âge *</label>
          <input name="age" type="number" min={15} max={45} required defaultValue={p?.age} className={input} />
        </div>
        <div>
          <label className={label}>Club *</label>
          <input name="club" required defaultValue={p?.club} placeholder="Valenciennes FC" className={input} />
        </div>
        <div>
          <label className={label}>Fin de contrat</label>
          <input name="contract_end" defaultValue={p?.contract_end} placeholder="Juin 2027" className={input} />
        </div>
        <div>
          <label className={label}>Valeur estimée</label>
          <input name="est_value" defaultValue={p?.est_value} placeholder="2,5 M€" className={input} />
        </div>
        <div>
          <label className={label}>Statut</label>
          <select name="status" defaultValue={p?.status ?? "ok"} className={input}>
            <option value="ok">Sous contrat — rien d&apos;urgent</option>
            <option value="soon">À surveiller (contrat &lt; 12 mois)</option>
            <option value="urgent">Urgent (mandat / échéance proche)</option>
          </select>
        </div>
        <div>
          <label className={label}>Libellé du statut</label>
          <input name="status_label" defaultValue={p?.status_label} placeholder="Sous contrat" className={input} />
        </div>
        <div>
          <label className={label}>Salaire</label>
          <input name="salary" defaultValue={p?.salary} placeholder="20 K€/mois" className={input} />
        </div>
        <div>
          <label className={label}>Mandat</label>
          <input name="mandate" defaultValue={p?.mandate} placeholder="Exclusif · exp. 06/2027" className={input} />
        </div>
        <div>
          <label className={label}>Pied fort</label>
          <select name="strong_foot" defaultValue={p?.strong_foot ?? "Droit"} className={input}>
            <option>Droit</option><option>Gauche</option><option>Ambidextre</option>
          </select>
        </div>
        <div>
          <label className={label}>Taille</label>
          <input name="height" defaultValue={p?.height} placeholder="1,82 m" className={input} />
        </div>
        <div className="col-span-2">
          <label className={label}>Nationalité</label>
          <input name="nationality" defaultValue={p?.nationality} placeholder="France / Mali" className={input} />
        </div>
        <div className="col-span-2">
          <label className={label}>Notes internes</label>
          <textarea name="notes" rows={3} defaultValue={p?.notes} placeholder="Contexte, objectifs, négociations en cours…" className={input} />
        </div>
      </div>
    </>
  );
}

export function playerFromForm(fd: FormData) {
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  const status = (["ok", "soon", "urgent"].includes(s("status")) ? s("status") : "ok") as "ok" | "soon" | "urgent";
  const defaultLabel = { ok: "Sous contrat", soon: "Contrat < 12 mois", urgent: "Échéance proche" }[status];
  return {
    name: s("name"), position: s("position"), age: Number(s("age")) || 18, club: s("club"),
    contract_end: s("contract_end") || "—", est_value: s("est_value") || "—",
    status, status_label: s("status_label") || defaultLabel,
    salary: s("salary") || "—", mandate: s("mandate") || "—",
    strong_foot: s("strong_foot") || "Droit", height: s("height") || "—",
    nationality: s("nationality") || "—", notes: s("notes"),
  };
}
