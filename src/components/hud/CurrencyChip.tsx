import type { LucideIcon } from "lucide-react";

interface CurrencyChipProps {
  Icon: LucideIcon;
  value: number;
  color: "yellow" | "blue" | "purple" | "green";
}

const COLOR_MAP = {
  yellow: {
    bg: "bg-[var(--ar-yellow-500)]/15",
    text: "text-[var(--ar-yellow-500)]",
    border: "border-[var(--ar-yellow-500)]/30",
    glow: "shadow-[0_0_10px_rgba(234,179,8,0.2)]",
  },
  blue: {
    bg: "bg-[var(--ar-blue-500)]/15",
    text: "text-[var(--ar-blue-300)]",
    border: "border-[var(--ar-blue-500)]/30",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_10px_rgba(168,85,247,0.2)]",
  },
  green: {
    bg: "bg-[var(--ar-green-600)]/15",
    text: "text-[var(--ar-green-400)]",
    border: "border-[var(--ar-green-600)]/30",
    glow: "shadow-[0_0_10px_rgba(22,163,74,0.2)]",
  },
};

export function CurrencyChip({ Icon, value, color }: CurrencyChipProps) {
  const c = COLOR_MAP[color];
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-shadow hover:shadow-lg ${c.bg} ${c.border} ${c.glow}`}
    >
      <Icon className={`h-4 w-4 ${c.text}`} strokeWidth={2.5} />
      <span className={`text-sm font-bold tabular-nums ${c.text}`}>
        {value.toLocaleString("es-PE")}
      </span>
    </div>
  );
}
