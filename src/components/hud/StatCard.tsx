interface StatCardProps {
  titulo: string;
  valor: string | number;
  icon?: string;
  hint?: string;
  variant?: "default" | "fire" | "green";
}

const VARIANT_MAP = {
  default:
    "border-[var(--ar-gray-200)] bg-white",
  fire:
    "border-[var(--ar-orange-500)]/30 bg-gradient-to-br from-[var(--ar-orange-500)]/10 to-[var(--ar-yellow-500)]/10",
  green:
    "border-[var(--ar-green-600)]/30 bg-gradient-to-br from-[var(--ar-green-600)]/10 to-[var(--ar-green-500)]/5",
};

export function StatCard({ titulo, valor, icon, hint, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-3 ${VARIANT_MAP[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
          {titulo}
        </span>
        {icon && <span className="text-base leading-none">{icon}</span>}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums text-[var(--ar-navy-900)]">
        {valor}
      </div>
      {hint && (
        <div className="mt-0.5 text-[10px] text-[var(--ar-navy-500)]">{hint}</div>
      )}
    </div>
  );
}
