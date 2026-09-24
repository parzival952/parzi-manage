"use client";
import type { CSSProperties } from "react";
import { useFormStatus } from "react-dom";

/**
 * Bouton de formulaire avec état d'attente : désactivé pendant l'envoi, ce qui
 * évite aussi les doubles envois (actions IA de 10-30 s, inscription…).
 */
export default function SubmitButton({
  label,
  pendingLabel,
  className,
  style,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      style={style}
      className={(className ?? "") + (pending ? " opacity-70 cursor-wait" : "")}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
