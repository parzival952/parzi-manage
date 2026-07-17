export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createEvent, deleteEvent, getEvents } from "@/lib/queries";

const input = "glass-input rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2a78d6]";

export default async function CalendrierPage() {
  const user = await requireUser();
  const events = await getEvents(user.id);
  const days = [...new Set(events.map((e) => e.day_label))];

  async function add(formData: FormData) {
    "use server";
    const u = await requireUser();
    const s = (k: string) => String(formData.get(k) ?? "").trim();
    if (!s("title")) return;
    await createEvent(u.id, { day_label: s("day") || "À planifier", time_label: s("time") || "—", title: s("title"), location: s("location") });
    revalidatePath("/calendrier");
    revalidatePath("/dashboard");
  }

  async function remove(formData: FormData) {
    "use server";
    const u = await requireUser();
    await deleteEvent(u.id, Number(formData.get("id")));
    revalidatePath("/calendrier");
    revalidatePath("/dashboard");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-1">Calendrier</h1>
      <p className="text-sm text-[#898781] mb-6">Rendez-vous, matchs, échéances · {events.length} événement{events.length > 1 ? "s" : ""}</p>

      <div className="glass-card p-4 mb-4">
        <form action={add} className="flex gap-2 flex-wrap">
          <input name="day" placeholder="Jour (ex. Lundi 21 juil.)" className={`${input} w-44`} />
          <input name="time" placeholder="Heure" className={`${input} w-24`} />
          <input name="title" required placeholder="Quoi ? *" className={`${input} flex-1 min-w-48`} />
          <input name="location" placeholder="Où / détail" className={`${input} w-48`} />
          <button type="submit" className="bg-[#2a78d6] text-white text-[13px] font-semibold rounded-lg px-4">+ Ajouter</button>
        </form>
      </div>

      <div className="glass-card p-4">
        {events.length === 0 ? (
          <p className="text-[13px] text-[#898781] py-4 text-center">Aucun événement — ajoute ton premier rendez-vous ci-dessus.</p>
        ) : (
          days.map((day) => (
            <div key={day}>
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#898781] mt-3 first:mt-0 mb-1">{day}</div>
              {events.filter((e) => e.day_label === day).map((e) => (
                <div key={e.id} className="flex gap-3 py-1.5 border-b border-[#eceae4] last:border-0 items-start">
                  <span className="text-[12px] font-semibold text-[#2a78d6] min-w-14 tabular-nums">{e.time_label}</span>
                  <div className="flex-1">
                    <div className="text-[13px]">{e.title}</div>
                    <div className="text-[11px] text-[#898781]">{e.location}</div>
                  </div>
                  <form action={remove}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" title="Supprimer" className="text-[#898781] hover:text-[#d03b3b] text-[13px]">✕</button>
                  </form>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
