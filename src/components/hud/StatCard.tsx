import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  Icon?: LucideIcon;
  hint?: string;
  variant?: "default" | "fire" | "green";
}

const VARIANT_MAP = {
  default: {
    box: "border-[var(--ar-gray-200)] bg-white",
    icon: "text-[var(--ar-navy-500)]",
  },
  fire: {
    box: "border-[var(--ar-orange-500)]/30 bg-gradient-to-br from-[var(--ar-orange-500)]/10 to-[var(--ar-yellow-500)]/10",
    icon: "text-[var(--ar-orange-500)]",
  },
  green: {
    box: "border-[var(--ar-green-600)]/30 bg-gradient-to-br from-[var(--ar-green-600)]/10 to-[var(--ar-green-500)]/5",
    icon: "text-[var(--ar-green-600)]",
  },
};

export function StatCard({
  titulo,
  valor,
  Icon,
  hint,
  variant = "default",
}: StatCardProps) {
  const v = VARIANT_MAP[variant];
  return (
    <div className={`rounded-xl border p-3 ${v.box}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
          {titulo}
        </span>
        {Icon && <Icon className={`h-4 w-4 ${v.icon}`} strokeWidth={2.25} />}
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
