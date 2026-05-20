import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  Icon?: LucideIcon;
}

export function Field({ label, Icon, id, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ar-navy-700)]">
        {label}
      </span>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ar-navy-500)]"
            strokeWidth={2.25}
          />
        )}
        <input
          id={id}
          {...rest}
          className={`w-full rounded-lg border border-[var(--ar-gray-200)] bg-white py-2.5 text-sm text-[var(--ar-navy-900)] outline-none transition-colors placeholder:text-[var(--ar-navy-500)]/60 focus:border-[var(--ar-green-600)] focus:ring-2 focus:ring-[var(--ar-green-600)]/20 ${
            Icon ? "pl-10 pr-3" : "px-3"
          }`}
        />
      </div>
    </label>
  );
}
