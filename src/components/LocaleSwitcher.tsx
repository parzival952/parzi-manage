import { LOCALES, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = { fr: "Français", en: "English" };

/** Sélecteur de langue — soumet à une action serveur (pose du cookie côté serveur). */
export default function LocaleSwitcher({ current, action }: { current: Locale; action: (formData: FormData) => void }) {
  return (
    <div className="flex gap-2">
      {LOCALES.map((l) => (
        <form key={l} action={action}>
          <input type="hidden" name="locale" value={l} />
          <button
            type="submit"
            className={
              "text-[13px] rounded-lg px-3.5 py-1.5 border transition-colors " +
              (l === current
                ? "border-[#2563eb] text-[#2563eb] font-semibold bg-[#2563eb]/5"
                : "border-black/10 text-[#52514e] hover:border-[#2563eb]/50")
            }
          >
            {LABELS[l]}
          </button>
        </form>
      ))}
    </div>
  );
}
