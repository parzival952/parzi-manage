"use client";

import { useState, useTransition } from "react";

import AcademyIcon from "@/components/AcademyIcon";

const MAX = 4000;

type SaveResult = { ok: true; body: string } | { ok: false; error: string };

/**
 * Notes personnelles de l'élève sur une leçon. Enregistrement au clic, avec
 * Cmd/Ctrl + Entrée, ou automatiquement quand on quitte le champ.
 */
export default function LessonNotes({
  initial,
  onSave,
  compact = false,
}: {
  initial: string;
  onSave: (body: string) => Promise<SaveResult>;
  compact?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const dirty = value.trim() !== saved.trim();

  function save() {
    if (!dirty || pending) return;
    const body = value;
    startTransition(async () => {
      try {
        const res = await onSave(body);
        if (res.ok) {
          setSaved(res.body);
          setValue(res.body);
          setStatus("saved");
          setError("");
        } else {
          setStatus("error");
          setError(res.error);
        }
      } catch {
        setStatus("error");
        setError("Enregistrement impossible. Réessaie.");
      }
    });
  }

  return (
    <section className={compact ? "pz-card p-4" : "pz-card p-5"}>
      <div className="flex items-center justify-between gap-3">
        <div className="pz-eyebrow inline-flex items-center gap-1.5" style={{ color: "var(--argent)" }}>
          <AcademyIcon name="notes" size={12} /> Mes notes
        </div>
        <span className="text-[10.5px] pz-muted pz-mono" aria-live="polite">
          {pending
            ? "Enregistrement…"
            : status === "error"
              ? ""
              : dirty
                ? "Non enregistré"
                : status === "saved"
                  ? "Enregistré ✓"
                  : saved
                    ? "Enregistré"
                    : ""}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value.slice(0, MAX));
          if (status !== "idle") setStatus("idle");
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            save();
          }
        }}
        rows={compact ? 5 : 6}
        maxLength={MAX}
        placeholder="Ce que tu retiens, un exemple à toi, une question à creuser… Tes notes sont privées et reprises dans l'aide-mémoire."
        aria-label="Mes notes sur cette leçon"
        className="w-full mt-2.5 rounded-xl px-3 py-2.5 text-[13px] leading-6 resize-y focus:outline-none"
        style={{
          background: "rgba(var(--ink-rgb),.035)",
          border: "1px solid var(--ligne)",
          color: "var(--blanc)",
        }}
      />

      {status === "error" ? (
        <p className="text-[11.5px] mt-1.5" style={{ color: "var(--rouge-clair)" }}>
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 mt-2">
        <span className="text-[10.5px] pz-muted pz-mono">
          {value.length}/{MAX}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="pz-btn ghost disabled:opacity-40"
          style={{ padding: "7px 12px", fontSize: 12 }}
        >
          Enregistrer
        </button>
      </div>
    </section>
  );
}
