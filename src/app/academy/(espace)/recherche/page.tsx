export const dynamic = "force-dynamic";

import Link from "next/link";

import AcademyIcon from "@/components/AcademyIcon";
import { getAllLessonNotes } from "@/lib/academy-notes";
import { highlight, searchAcademy, type SearchHit } from "@/lib/academy-search";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Recherche" };

const SUGGESTIONS = ["mandat", "clause libératoire", "mineurs", "TVA", "commission", "mercato"];

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  lecon: "Leçon",
  glossaire: "Glossaire",
  note: "Ma note",
};

export default async function AcademySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const query = q.slice(0, 120);

  const notes = query ? [...(await getAllLessonNotes(user.id)).values()] : [];
  const { terms, hits } = searchAcademy(query, notes);

  return (
    <main className="flex flex-col gap-6">
      <header className="pz-rise">
        <div className="pz-eyebrow" style={{ color: "var(--rouge-vif)" }}>
          Recherche
        </div>
        <h1 className="text-[26px] mt-2">Trouver une notion</h1>
        <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
          Cherche dans les leçons, le glossaire et tes notes. Un résultat t&apos;emmène directement au
          bon paragraphe.
        </p>

        <form action="/academy/recherche" className="mt-5 flex gap-2" role="search">
          <label className="relative flex-1">
            <span className="sr-only">Rechercher</span>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pz-muted">
              <AcademyIcon name="search" size={17} />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="Ex. : clause libératoire, TVA, mineurs…"
              className="w-full rounded-xl pl-10 pr-4 py-3 text-[14.5px] focus:outline-none"
              style={{
                background: "rgba(var(--ink-rgb),.04)",
                border: "1px solid var(--ligne)",
                color: "var(--blanc)",
              }}
            />
          </label>
          <button type="submit" className="pz-btn" style={{ padding: "0 20px" }}>
            Chercher
          </button>
        </form>
      </header>

      {!query ? (
        <section className="pz-card p-5 pz-rise pz-d1">
          <div className="pz-eyebrow pz-muted">Idées de recherche</div>
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/academy/recherche?q=${encodeURIComponent(s)}`}
                className="rounded-full px-3.5 py-1.5 text-[12.5px] hover:text-white"
                style={{ border: "1px solid var(--ligne)", color: "var(--texte-2)" }}
              >
                {s}
              </Link>
            ))}
          </div>
        </section>
      ) : hits.length === 0 ? (
        <section className="pz-card p-6 text-center pz-rise pz-d1">
          <p className="text-[14px]">Aucun résultat pour « {query} ».</p>
          <p className="text-[12.5px] pz-muted mt-2">
            Essaie un mot plus court ou un synonyme (par exemple « contrat » plutôt que « contractualisation »).
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-3 pz-rise pz-d1" aria-label="Résultats">
          <p className="text-[12px] pz-muted pz-mono">
            {hits.length} résultat{hits.length > 1 ? "s" : ""}
            {hits.length >= 40 ? " (les 40 plus pertinents)" : ""}
          </p>
          {hits.map((hit, i) => (
            <Link
              key={`${hit.href}-${i}`}
              href={hit.href}
              className="pz-card p-4 block hover:border-[color:var(--rouge)] transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className="pz-mono rounded-md px-1.5 py-0.5"
                  style={{
                    border: "1px solid var(--ligne)",
                    color: hit.kind === "note" ? "var(--argent)" : hit.kind === "glossaire" ? "var(--or)" : "var(--rouge-vif)",
                  }}
                >
                  {KIND_LABEL[hit.kind]}
                </span>
                <span className="pz-muted truncate">{hit.context}</span>
              </div>
              <div className="text-[15px] font-bold mt-1.5">
                {highlight(hit.title, terms).map((part, k) =>
                  part.hit ? (
                    <mark key={k} className="rounded-sm px-0.5" style={{ background: "rgba(194,24,51,.22)", color: "inherit" }}>
                      {part.text}
                    </mark>
                  ) : (
                    <span key={k}>{part.text}</span>
                  ),
                )}
              </div>
              <p className="text-[12.5px] leading-6 mt-1" style={{ color: "var(--texte-2)" }}>
                {highlight(hit.snippet, terms).map((part, k) =>
                  part.hit ? (
                    <mark key={k} className="rounded-sm px-0.5" style={{ background: "rgba(194,24,51,.22)", color: "inherit" }}>
                      {part.text}
                    </mark>
                  ) : (
                    <span key={k}>{part.text}</span>
                  ),
                )}
              </p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
