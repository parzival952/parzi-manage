export default function Loading() {
  return (
    <div className="grid place-items-center py-24">
      <div className="glass-card px-6 py-4 flex items-center gap-3">
        <span className="inline-block w-4 h-4 rounded-full border-2 border-[#2a78d6] border-t-transparent animate-spin" />
        <span className="text-[13.5px] text-[#51586a]">Chargement…</span>
      </div>
    </div>
  );
}
