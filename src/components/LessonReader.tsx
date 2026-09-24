"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import AcademyIcon from "@/components/AcademyIcon";

/**
 * Lecteur de leçon avec narration synchronisée (Web Speech API).
 *
 * - Lit à voix haute chaque bloc de la leçon (voix fr-FR), dans l'ordre.
 * - Le bloc lu est surligné et défile automatiquement (transcription qui suit).
 * - À l'intérieur du bloc lu, chaque MOT s'illumine en fondu au moment où il
 *   est prononcé (événements « boundary »). Repli propre : sans ces
 *   événements, on garde la surbrillance du paragraphe.
 * - « Écouter » démarre sur le 1er paragraphe (fondu immédiat) ; un clic sur un
 *   paragraphe démarre la lecture à partir de là.
 * - Lecture séquentielle (un segment puis le suivant via onend) + relance
 *   périodique pour contourner la coupure de Chrome au bout de ~15 s.
 * - Aucune dépendance ni coût serveur. Sans support de la synthèse vocale, le
 *   contenu s'affiche normalement, sans les commandes.
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

type Segment = { text: string; block: number };

function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, "")
    .replace(/·/g, ", ")
    .replace(/—/g, ", ")
    .replace(/«|»/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Rendu mot par mot avec fondu progressif : mots lus clairs, mot courant en
// vert illuminé, mots suivants atténués.
function renderWords(text: string, progress: number) {
  const parts = text.split(" ");
  const readCount = Math.round(progress * parts.length);
  return parts.map((word, i) => {
    const state = i < readCount ? "read" : i === readCount ? "current" : "upcoming";
    return (
      <span
        key={i}
        style={{
          // Fondu mot par mot, sans halo : à venir (estompé) → lu (blanc cassé),
          // le mot en cours ressort en blanc pur souligné d'un filet rubis.
          color:
            state === "upcoming"
              ? "rgba(var(--ink-rgb),0.36)"
              : state === "current"
                ? "var(--blanc)"
                : "var(--blanc)",
          textDecorationLine: state === "current" ? "underline" : "none",
          textDecorationColor: "rgba(194,24,51,0.85)",
          textDecorationThickness: "2px",
          textUnderlineOffset: "4px",
          transition: "color .28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {word}
        {i < parts.length - 1 ? " " : ""}
      </span>
    );
  });
}

export default function LessonReader({ blocks }: { blocks: string[] }) {
  const supported = useSyncExternalStore(
    subscribe,
    getSupportedSnapshot,
    getServerSnapshot,
  );
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState(1);
  const [activeBlock, setActiveBlock] = useState<number>(-1);
  const [activeSeg, setActiveSeg] = useState(0);
  const [wordProgress, setWordProgress] = useState(0);
  const [boundaryOk, setBoundaryOk] = useState(false);

  const rateRef = useRef(rate);
  const curSegRef = useRef(0);
  const genRef = useRef(0);
  const blockRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const segments = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    blocks.forEach((b, i) => {
      const t = cleanForSpeech(b);
      if (t) segs.push({ text: t, block: i });
    });
    return segs;
  }, [blocks]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

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

  function speakSegment(i: number, gen: number) {
    if (gen !== genRef.current) return;
    if (i >= segments.length) {
      setStatus("idle");
      setActiveBlock(-1);
      setActiveSeg(0);
      setWordProgress(0);
      curSegRef.current = 0;
      return;
    }
    const synth = window.speechSynthesis;
    const seg = segments[i];
    const utter = new SpeechSynthesisUtterance(seg.text);
    utter.lang = "fr-FR";
    utter.rate = rateRef.current;
    const voice = pickFrVoice(synth);
    if (voice) utter.voice = voice;

    utter.onstart = () => {
      if (gen !== genRef.current) return;
      curSegRef.current = i;
      setActiveSeg(i);
      setActiveBlock(seg.block);
      setWordProgress(0);
    };
    utter.onboundary = (event: SpeechSynthesisEvent) => {
      if (gen !== genRef.current) return;
      if (typeof event.charIndex !== "number") return;
      const frac = Math.min(
        1,
        Math.max(0, event.charIndex / Math.max(1, seg.text.length)),
      );
      setBoundaryOk(true);
      setWordProgress(frac);
    };
    utter.onend = () => {
      if (gen === genRef.current) speakSegment(i + 1, gen);
    };
    utter.onerror = () => {
      if (gen === genRef.current) speakSegment(i + 1, gen);
    };
    synth.speak(utter);
  }

  function speakFrom(startSeg: number) {
    if (!supported || segments.length === 0) return;
    genRef.current += 1;
    const gen = genRef.current;
    const synth = window.speechSynthesis;
    synth.cancel();
    setStatus("playing");
    setActiveSeg(startSeg);
    setActiveBlock(segments[startSeg]?.block ?? -1);
    setWordProgress(0);
    // Laisse cancel() se propager avant de relancer (course connue de Chrome).
    window.setTimeout(() => speakSegment(startSeg, gen), 80);
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
    genRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setActiveBlock(-1);
    setActiveSeg(0);
    setWordProgress(0);
    curSegRef.current = 0;
  }

  function cycleRate() {
    const order = [1, 1.25, 1.5, 0.75];
    const nextRate = order[(order.indexOf(rate) + 1) % order.length];
    setRate(nextRate);
    rateRef.current = nextRate;
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
            top: 72, // sous l'en-tête collant de l'Academy
            zIndex: 2,
            background: "var(--anthracite-2)",
            border: "1px solid var(--ligne)",
          }}
        >
          <AcademyIcon name="headphones" size={16} style={{ color: "var(--argent)" }} />

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
            style={{ height: 6, background: "rgba(var(--ink-rgb),0.07)" }}
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
              background: "rgba(var(--ink-rgb),.05)",
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
        const sweeping = boundaryOk && active;
        return (
          <p
            key={blockIndex}
            id={`bloc-${blockIndex}`}
            ref={(el) => {
              blockRefs.current[blockIndex] = el;
            }}
            onClick={supported ? () => startFromBlock(blockIndex) : undefined}
            title={supported ? "Lire à partir d'ici" : undefined}
            className="pz-cible text-[14.5px] leading-relaxed transition-colors"
            style={{
              color: active ? "var(--blanc)" : "var(--texte-2)",
              cursor: supported ? "pointer" : "default",
              borderLeft: active
                ? "3px solid var(--rouge)"
                : "3px solid transparent",
              background: active ? "rgba(var(--ink-rgb),0.035)" : "transparent",
              borderRadius: 10,
              padding: "8px 10px",
              margin: "0 -10px",
            }}
          >
            {sweeping ? renderWords(block, wordProgress) : block}
          </p>
        );
      })}
    </section>
  );
}
