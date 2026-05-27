export function NivelBadge({ nivel }: { nivel: number }) {
  return (
    <div className="relative animate-float">
      <div className="glow-yellow flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[var(--ar-yellow-500)] bg-gradient-to-br from-[var(--ar-navy-900)] to-[var(--ar-navy-700)] shadow-lg">
        <div className="flex flex-col items-center leading-none">
          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--ar-yellow-500)]/70">
            Nivel
          </span>
          <span className="text-lg font-black tabular-nums text-[var(--ar-yellow-500)]">
            {nivel}
          </span>
        </div>
      </div>
    </div>
  );
}
