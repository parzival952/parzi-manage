"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Lecteur audio de leçon — narration via la synthèse vocale du navigateur
 * (Web Speech API). Aucune dépendance ni coût : le texte affiché sert de
 * transcription, ce composant le lit à voix haute. Se masque si non supporté.
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

export default function LessonAudio({
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
  const rateRef = useRef(rate);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!supported) return;
    // Précharge la liste des voix (certains navigateurs la remplissent tard).
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

  function cleanForSpeech(text: string): string {
    return text
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, "")
      .replace(/·/g, ", ")
      .replace(/—/g, ", ")
      .replace(/«|»/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fullText(): string {
    return [title, intro, ...blocks]
      .map(cleanForSpeech)
      .filter(Boolean)
      .join(". ");
  }

  function play() {
    if (!supported) return;
    const synth = window.speechSynthesis;

    if (status === "paused") {
      synth.resume();
      setStatus("playing");
      return;
    }

    synth.cancel();
    const utter = new SpeechSynthesisUtterance(fullText());
    utter.lang = "fr-FR";
    utter.rate = rateRef.current;
    const voices = synth.getVoices();
    const frVoice =
      voices.find((v) => v.lang?.toLowerCase().startsWith("fr")) ?? null;
    if (frVoice) {
      utter.voice = frVoice;
    }
    utter.onend = () => setStatus("idle");
    utter.onerror = () => setStatus("idle");
    synth.speak(utter);
    setStatus("playing");
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
  }

  function cycleRate() {
    const order = [1, 1.25, 1.5, 0.75];
    const nextRate = order[(order.indexOf(rate) + 1) % order.length];
    setRate(nextRate);
    // Si une lecture est en cours, on la relance au nouveau débit.
    if (status !== "idle") {
      stop();
      setTimeout(() => play(), 60);
    }
  }

  if (!supported) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-3 py-2"
      style={{
        background: "rgba(255,255,255,.035)",
        border: "1px solid var(--ligne)",
      }}
    >
      <span className="text-[16px]">🎧</span>

      {status === "playing" ? (
        <button type="button" onClick={pause} className="pz-btn" style={{ padding: "6px 12px" }}>
          ⏸ Pause
        </button>
      ) : (
        <button type="button" onClick={play} className="pz-btn" style={{ padding: "6px 12px" }}>
          ▶ {status === "paused" ? "Reprendre" : "Écouter la leçon"}
        </button>
      )}

      {status !== "idle" ? (
        <button
          type="button"
          onClick={stop}
          className="pz-btn ghost"
          style={{ padding: "6px 12px" }}
        >
          ⏹
        </button>
      ) : null}

      <button
        type="button"
        onClick={cycleRate}
        className="text-[11px] font-bold rounded-full px-2.5 py-1 ml-auto"
        style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--ligne)" }}
        title="Vitesse de lecture"
      >
        {rate}×
      </button>
    </div>
  );
}
