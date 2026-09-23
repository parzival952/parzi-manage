import AcademyIcon, { type AcademyIconName } from "@/components/AcademyIcon";

// Badges et trophées : leurs définitions (src/lib/badges.ts, trophies.ts)
// gardent un repère emoji ; à l'affichage on grave une icône au trait à la
// place (design system Academy : sobre, jamais « gaming »).
const GLYPHS: Record<string, AcademyIconName> = {
  "🚀": "rocket",
  "📘": "book",
  "📚": "layers",
  "📖": "bookOpen",
  "🔥": "flame",
  "🧱": "blocks",
  "🏗️": "columns",
  "🏗": "columns",
  "🧠": "bulb",
  "🎯": "target",
  "💯": "check",
  "📅": "calendar",
  "⚡": "bolt",
  "💎": "gem",
  "⭐": "star",
  "👑": "crown",
  "🏅": "medal",
  "🎖️": "medal",
  "🎖": "medal",
  "🏆": "trophy",
  "✦": "sparkle",
  "🪜": "rise",
  "🧭": "compass",
  "🗻": "mountain",
  "🕊️": "feather",
  "🕊": "feather",
  "🛡️": "shield",
  "🛡": "shield",
};

export default function CollectibleGlyph({
  icon,
  size = 22,
  color,
}: {
  icon: string;
  size?: number;
  color?: string;
}) {
  const name = GLYPHS[icon];
  if (!name) return <span style={{ color }}>{icon}</span>;
  return <AcademyIcon name={name} size={size} strokeWidth={1.5} style={{ color }} />;
}
