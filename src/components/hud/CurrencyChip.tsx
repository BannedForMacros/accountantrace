interface CurrencyChipProps {
  icon: string;
  value: number;
  color: "yellow" | "blue" | "purple" | "green";
}

const COLOR_MAP = {
  yellow: "bg-[var(--ar-yellow-500)]/10 text-[var(--ar-yellow-500)] border-[var(--ar-yellow-500)]/30",
  blue: "bg-[var(--ar-blue-500)]/10 text-[var(--ar-blue-500)] border-[var(--ar-blue-500)]/30",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  green: "bg-[var(--ar-green-600)]/10 text-[var(--ar-green-600)] border-[var(--ar-green-600)]/30",
};

export function CurrencyChip({ icon, value, color }: CurrencyChipProps) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${COLOR_MAP[color]}`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-semibold tabular-nums">
        {value.toLocaleString("es-PE")}
      </span>
    </div>
  );
}
