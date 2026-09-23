"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * Lecteur de leçon avec narration synchronisée (Web Speech API).
 *
 * - Lit à voix haute le titre + l'intro puis chaque bloc (voix fr-FR).
 * - Le bloc en cours de lecture est surligné et défile automatiquement à
 *   l'écran : le texte affiché sert de transcription qui « suit ».
 * - Découpage bloc par bloc + relance périodique pour contourner la coupure
 *   de Chrome au bout de ~15 s sur les longues lectures.
 * - Clic sur un paragraphe = démarrer la lecture à partir de là.
 * - Aucune dépendance ni coût serveur. Si le navigateur ne supporte pas la
 *   synthèse vocale, le contenu s'affiche normalement, sans les commandes.
 *
 * La détection de support passe par useSyncExternalStore : rendu serveur et
 * première hydratation renvoient `false` (pas de window), puis le client
 * bascule sans erreur d'hydratation ni setState synchrone dans un effet.
 */
function subscribe() {
  return () => {};
}

function getSupportedSnapshot() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getServerSnapshot() {
  return false;
}

type Segment = { text: string; block: number | null };

function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, "")
    .replace(/·/g, ", ")
    .replace(/—/g, ", ")
    .replace(/«|»/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function LessonReader({
  title,
  intro,
  blocks,
}: {
  title: string;
  intro: string;
  blocks: string[];
}) {
  const supported = useSyncExternalStore(
    subscribe,
    getSupportedSnapshot,
    getServerSnapshot,
  );
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState(1);
  const [activeBlock, setActiveBlock] = useState<number>(-1);
  const [activeSeg, setActiveSeg] = useState(0);

  const rateRef = useRef(rate);
  const curSegRef = useRef(0);
  const blockRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const segments = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    const lead = [cleanForSpeech(title), cleanForSpeech(intro)]
      .filter(Boolean)
      .join(". ");
    if (lead) segs.push({ text: lead, block: null });
    blocks.forEach((b, i) => {
      const t = cleanForSpeech(b);
      if (t) segs.push({ text: t, block: i });
    });
    return segs;
  }, [title, intro, blocks]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Précharge les voix (certains navigateurs les remplissent tardivement)
  // et coupe la lecture au démontage.
  useEffect(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.getVoices();
    } catch {
      /* ignore */
    }
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [supported]);

  // Fait défiler le bloc lu au centre de l'écran.
  useEffect(() => {
    if (activeBlock < 0) return;
    const el = blockRefs.current[activeBlock];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeBlock]);

  // Contourne le bug Chrome : la synthèse s'arrête seule après ~15 s.
  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      try {
        const s = window.speechSynthesis;
        if (s.speaking && !s.paused) {
          s.resume();
        }
      } catch {
        /* ignore */
      }
    }, 9000);
    return () => window.clearInterval(id);
  }, [status]);

  function pickFrVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
    const voices = synth.getVoices();
    return voices.find((v) => v.lang?.toLowerCase().startsWith("fr")) ?? null;
  }

  function speakFrom(startSeg: number) {
    if (!supported || segments.length === 0) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const voice = pickFrVoice(synth);
    const lastIndex = segments.length - 1;

    for (let k = startSeg; k < segments.length; k++) {
      const seg = segments[k];
      const utter = new SpeechSynthesisUtterance(seg.text);
      utter.lang = "fr-FR";
      utter.rate = rateRef.current;
      if (voice) utter.voice = voice;
      utter.onstart = () => {
        curSegRef.current = k;
        setActiveSeg(k);
        setActiveBlock(seg.block ?? -1);
      };
      if (k === lastIndex) {
        utter.onend = () => {
          setStatus("idle");
          setActiveBlock(-1);
          setActiveSeg(0);
          curSegRef.current = 0;
        };
      }
      utter.onerror = () => {
        /* ignore — l'utterance suivante prend le relais */
      };
      synth.speak(utter);
    }
    setStatus("playing");
  }

  function play() {
    if (!supported) return;
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }
    speakFrom(0);
  }

  function pause() {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setActiveBlock(-1);
    setActiveSeg(0);
    curSegRef.current = 0;
  }

  function cycleRate() {
    const order = [1, 1.25, 1.5, 0.75];
    const nextRate = order[(order.indexOf(rate) + 1) % order.length];
    setRate(nextRate);
    rateRef.current = nextRate;
    // Relance au débit choisi si une lecture est en cours.
    if (status !== "idle") {
      speakFrom(curSegRef.current);
    }
  }

  function startFromBlock(blockIndex: number) {
    if (!supported) return;
    const seg = segments.findIndex((s) => s.block === blockIndex);
    speakFrom(seg >= 0 ? seg : 0);
  }

  const progressPct =
    status === "idle" || segments.length === 0
      ? 0
      : Math.round(((activeSeg + 1) / segments.length) * 100);

  return (
    <section className="pz-card p-6 flex flex-col gap-4 pz-rise pz-d1">
      {supported ? (
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{
            position: "sticky",
            top: 8,
            zIndex: 2,
            background: "var(--anthracite-2)",
            border: "1px solid var(--ligne)",
          }}
        >
          <span className="text-[15px]" aria-hidden>
            🎧
          </span>

          {status === "playing" ? (
            <button
              type="button"
              onClick={pause}
              className="pz-btn"
              style={{ padding: "6px 12px" }}
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={play}
              className="pz-btn"
              style={{ padding: "6px 12px" }}
            >
              ▶ {status === "paused" ? "Reprendre" : "Écouter"}
            </button>
          )}

          {status !== "idle" ? (
            <button
              type="button"
              onClick={stop}
              className="pz-btn ghost"
              style={{ padding: "6px 10px" }}
              aria-label="Arrêter la lecture"
            >
              ⏹
            </button>
          ) : null}

          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 6, background: "rgba(255,255,255,0.07)" }}
            aria-hidden
          >
            <div
              style={{
                height: "100%",
                width: progressPct + "%",
                background:
                  "linear-gradient(90deg, var(--rouge-profond), var(--rouge))",
                transition: "width .3s ease",
              }}
            />
          </div>

          <button
            type="button"
            onClick={cycleRate}
            className="text-[11px] font-bold rounded-full px-2.5 py-1"
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid var(--ligne)",
            }}
            title="Vitesse de lecture"
          >
            {rate}×
          </button>
        </div>
      ) : null}

      {blocks.map((block, blockIndex) => {
        const active = activeBlock === blockIndex;
        return (
          <p
            key={blockIndex}
            ref={(el) => {
              blockRefs.current[blockIndex] = el;
            }}
            onClick={supported ? () => startFromBlock(blockIndex) : undefined}
            title={supported ? "Lire à partir d'ici" : undefined}
            className="text-[14.5px] leading-relaxed transition-colors"
            style={{
              color: active ? "#EAF7EE" : "#D8DADF",
              cursor: supported ? "pointer" : "default",
              borderLeft: active
                ? "3px solid #1db954"
                : "3px solid transparent",
              background: active ? "rgba(29,185,84,0.08)" : "transparent",
              borderRadius: 10,
              padding: "6px 10px",
              margin: "0 -10px",
            }}
          >
            {block}
          </p>
        );
      })}
    </section>
  );
}
