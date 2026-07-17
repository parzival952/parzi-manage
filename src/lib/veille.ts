// Veille football — agrégation de flux RSS publics français.
// Aucune dépendance : mini-parseur XML tolérant. Chaque flux est en
// best-effort (un flux en panne n'affecte pas les autres). Cache 30 min.

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  date: Date | null;
};

const FEEDS: { url: string; source: string }[] = [
  { url: "https://www.lequipe.fr/rss/actu_rss_Football.xml", source: "L'Équipe" },
  { url: "https://rmcsport.bfmtv.com/rss/football/", source: "RMC Sport" },
  { url: "https://www.footmercato.net/rss", source: "Foot Mercato" },
  { url: "https://www.maxifoot.fr/rss.xml", source: "Maxifoot" },
];

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseFeed(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  for (const block of blocks.slice(0, 20)) {
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1];
    const link = block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1];
    const pub = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1];
    if (!title || !link) continue;
    const d = pub ? new Date(decode(pub)) : null;
    items.push({
      title: decode(title),
      link: decode(link),
      source,
      date: d && !isNaN(d.getTime()) ? d : null,
    });
  }
  return items;
}

export async function getVeille(): Promise<{ items: NewsItem[]; sourcesOk: number; sourcesTotal: number }> {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const r = await fetch(f.url, {
        headers: { "user-agent": "ParziManage/1.0 (+https://parzi-manage-parzi2.vercel.app)" },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(String(r.status));
      return parseFeed(await r.text(), f.source);
    })
  );
  const items = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, 40);
  return {
    items,
    sourcesOk: results.filter((r) => r.status === "fulfilled").length,
    sourcesTotal: FEEDS.length,
  };
}

/** Mots-clés du portefeuille (noms de famille des joueurs + clubs) pour repérer les actus qui concernent l'agent. */
export function portfolioKeywords(players: { name: string; club: string }[], prospects: { name: string; club: string }[]): string[] {
  const kws = new Set<string>();
  for (const p of [...players, ...prospects]) {
    // nom de famille (dernier mot du nom, ≥ 4 lettres pour éviter le bruit)
    const last = p.name.replace(/\(.*\)/, "").trim().split(/\s+/).pop() ?? "";
    if (last.length >= 4) kws.add(last.toLowerCase());
    // nom du club sans mentions annexes
    const club = p.club.replace(/\(.*\)/, "").trim();
    if (club.length >= 4 && club !== "—") kws.add(club.toLowerCase());
  }
  return [...kws];
}

export function matchesPortfolio(title: string, keywords: string[]): boolean {
  const t = title.toLowerCase();
  return keywords.some((k) => t.includes(k));
}
