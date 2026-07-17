const FEATURES = [
  ["✦", "Assistant IA personnel"],
  ["📊", "Brief du jour en 30 secondes"],
  ["⚽", "Joueurs, contrats & mandats"],
  ["🔔", "Alertes d'échéances automatiques"],
  ["🏟", "Clubs, besoins & budgets"],
  ["🔭", "Scouting & cibles"],
  ["👥", "CRM du réseau"],
  ["📅", "Agenda & mercato"],
  ["🔒", "Données privées & sécurisées"],
];

/** Bannière horizontale défilante des fonctionnalités (PC / tablette / mobile). */
export default function FeatureBanner() {
  const items = [...FEATURES, ...FEATURES]; // doublé pour la boucle infinie
  return (
    <div className="overflow-hidden border-y border-white/10 bg-white/[0.04] backdrop-blur-sm py-3.5 select-none">
      <div className="marquee-track">
        {items.map(([icon, label], i) => (
          <span key={i} className="flex items-center gap-2 px-6 text-[13.5px] text-[#c6cdd8] whitespace-nowrap">
            <span className="text-[15px]">{icon}</span> {label}
            <span className="text-[#3987e5] pl-6">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
