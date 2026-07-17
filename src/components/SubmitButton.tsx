"use client";
import { useFormStatus } from "react-dom";

/** Bouton de formulaire avec état d'attente — indispensable pour les actions IA (10-30 s). */
export default function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
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
