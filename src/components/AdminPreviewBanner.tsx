import Link from "next/link";

import AcademyIcon from "@/components/AcademyIcon";

/**
 * Bandeau réservé aux admins : bascule entre la vraie progression et l'aperçu
 * « tout débloqué ». Rendu seulement si l'utilisateur est admin.
 */
export default function AdminPreviewBanner({
  admin,
  preview,
  path,
}: {
  admin: boolean;
  preview: boolean;
  path: string;
}) {
  if (!admin) return null;

  if (!preview) {
    return (
      <div className="flex justify-end gap-4">
        <Link
          href="/academy/admin/inscrits"
          className="inline-flex items-center gap-1.5 text-[11.5px] pz-muted hover:text-white"
        >
          <AcademyIcon name="settings" size={12} /> Admin : inscrits
        </Link>
        <Link
          href={`${path}?apercu=1`}
          className="inline-flex items-center gap-1.5 text-[11.5px] pz-muted hover:text-white"
        >
          <AcademyIcon name="settings" size={12} /> Aperçu admin : tout débloquer à l&apos;écran
        </Link>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      style={{
        background: "rgba(var(--ink-rgb),.04)",
        border: "1px solid var(--argent)",
      }}
    >
      <div className="flex items-center gap-2 text-[12.5px]">
        <AcademyIcon name="settings" size={14} />
        <span>
          <b>Aperçu admin</b> — tout est affiché comme débloqué. Rien n&apos;est
          enregistré : ta progression, le classement et les diplômes ne changent pas.
        </span>
      </div>
      <Link href={path} className="text-[12px] font-bold pz-red hover:underline">
        Revenir à ma vraie progression
      </Link>
    </div>
  );
}
