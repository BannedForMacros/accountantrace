export function NivelBadge({ nivel }: { nivel: number }) {
  return (
    <div className="relative">
      <div className="ar-bg-navy-gradient flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[var(--ar-yellow-500)] shadow-lg">
        <span className="text-[10px] font-bold uppercase leading-none text-[var(--ar-yellow-500)]">
          Nivel
        </span>
      </div>
      <div className="absolute -bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--ar-yellow-500)] text-xs font-bold text-[var(--ar-navy-900)] shadow">
        {nivel}
      </div>
    </div>
  );
}
