interface XPBarProps {
  actual: number;
  meta: number;
  titulo?: string;
}

export function XPBar({ actual, meta, titulo }: XPBarProps) {
  const pct = meta > 0 ? Math.min(100, (actual / meta) * 100) : 0;
  return (
    <div className="flex w-full flex-col gap-1">
      {titulo && (
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/70">
          {titulo}
        </span>
      )}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-[var(--ar-navy-900)] shadow-inner ring-1 ring-inset ring-white/5">
        <div
          className="xp-bar-shimmer absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--ar-green-600)] via-[var(--ar-green-400)] to-[var(--ar-green-500)] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        {pct > 8 && (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            {Math.round(pct)}%
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium tabular-nums text-[var(--ar-blue-300)]/60">
        {actual.toLocaleString("es-PE")} / {meta.toLocaleString("es-PE")} XP
      </span>
    </div>
  );
}
