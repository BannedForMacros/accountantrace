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
    box: "game-card-light",
    icon: "text-[var(--ar-blue-300)]",
    value: "text-white",
    border: "",
  },
  fire: {
    box: "border-[var(--ar-orange-500)]/20 bg-gradient-to-br from-[var(--ar-orange-500)]/15 to-[var(--ar-yellow-500)]/10",
    icon: "text-[var(--ar-orange-500)] drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]",
    value: "text-[var(--ar-orange-500)]",
    border: "border border-[var(--ar-orange-500)]/20 rounded-xl",
  },
  green: {
    box: "border-[var(--ar-green-600)]/20 bg-gradient-to-br from-[var(--ar-green-600)]/15 to-[var(--ar-green-500)]/5",
    icon: "text-[var(--ar-green-400)] drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]",
    value: "text-[var(--ar-green-400)]",
    border: "border border-[var(--ar-green-600)]/20 rounded-xl",
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
    <div className={`stat-card rounded-xl p-3.5 ${v.box} ${v.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/60">
          {titulo}
        </span>
        {Icon && <Icon className={`h-4 w-4 ${v.icon}`} strokeWidth={2.25} />}
      </div>
      <div className={`mt-1 text-2xl font-black tabular-nums ${v.value}`}>
        {valor}
      </div>
      {hint && (
        <div className="mt-0.5 text-[10px] text-[var(--ar-blue-300)]/40">{hint}</div>
      )}
    </div>
  );
}
