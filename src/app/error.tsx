"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid place-items-center py-24">
      <div className="glass-card px-8 py-8 text-center max-w-md">
        <div className="text-3xl mb-3">⚽</div>
        <h1 className="font-bold text-[17px] mb-1.5">Oups, hors-jeu.</h1>
        <p className="text-[13.5px] text-[#51586a] mb-5">
          Une erreur inattendue s&apos;est produite. Réessaie — et si ça persiste, préviens-nous, on corrige vite.
        </p>
        <button
          onClick={reset}
          className="bg-[#2a78d6] hover:bg-[#2266bb] text-white font-semibold text-[13.5px] rounded-lg px-5 py-2.5"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
