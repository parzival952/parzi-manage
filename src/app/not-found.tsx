import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24">
      <div className="glass-card px-8 py-8 text-center max-w-md">
        <div className="text-3xl mb-3">🔭</div>
        <h1 className="font-bold text-[17px] mb-1.5">Page introuvable</h1>
        <p className="text-[13.5px] text-[#51586a] mb-5">
          Cette page n&apos;existe pas (ou plus). Retourne au dashboard pour retrouver ton portefeuille.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#2a78d6] hover:bg-[#2266bb] text-white font-semibold text-[13.5px] rounded-lg px-5 py-2.5"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
