// Écran de verrouillage des fonctions de contact (CRM, Clubs / démarchage).
// Affiché tant que l'agent n'est pas vérifié — voir lib/verification.ts.
import Link from "next/link";
import type { AgentStatus } from "@/lib/queries";
import { getServerT } from "@/lib/i18n-server";

export default async function VerificationGate({ status, feature }: { status: AgentStatus; feature: string }) {
  const { t } = await getServerT();
  const pending = status === "pending";

  return (
    <div className="max-w-xl mx-auto">
      <div className="glass-card p-7 text-center anim-rise">
        <span className="inline-grid place-items-center w-14 h-14 rounded-2xl text-white text-[26px] mb-4"
          style={{ background: pending ? "#d97706" : "linear-gradient(135deg,#2563eb,#4a3aa7)" }}>
          {pending ? "⏳" : "🔒"}
        </span>
        <h1 className="text-[19px] font-bold mb-2">{t("gate.title", { feature })}</h1>
        <p className="text-[13.5px] text-[#52514e] leading-relaxed mb-5">
          {pending ? t("gate.body_pending") : t("gate.body", { feature })}
        </p>

        {pending ? (
          <Link href="/verification" className="inline-block glass-input text-sm font-medium rounded-xl px-5 py-2.5 hover:border-[#2a78d6] hover:text-[#2563eb]">
            {t("gate.see_status")}
          </Link>
        ) : (
          <Link href="/verification" className="inline-block bg-[#2563eb] hover:bg-[#1d4fd7] text-white text-sm font-semibold rounded-xl px-5 py-2.5 shadow-md shadow-[#2563eb]/20">
            {t("gate.cta")}
          </Link>
        )}

        <p className="text-[11.5px] text-[#898781] mt-5 leading-relaxed">{t("gate.legal")}</p>
      </div>
    </div>
  );
}
