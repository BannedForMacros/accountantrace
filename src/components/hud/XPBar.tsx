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
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
          {titulo}
        </span>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--ar-gray-200)]">
        <div
          className="ar-bg-green-gradient absolute inset-y-0 left-0 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-[var(--ar-navy-700)]">
        {actual.toLocaleString("es-PE")} / {meta.toLocaleString("es-PE")} XP
      </span>
    </div>
  );
}
