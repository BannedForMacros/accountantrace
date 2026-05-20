"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function PasswordField({ label, id, ...rest }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--ar-navy-700)]">
        {label}
      </span>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ar-navy-500)]"
          strokeWidth={2.25}
        />
        <input
          id={id}
          type={show ? "text" : "password"}
          {...rest}
          className="w-full rounded-lg border border-[var(--ar-gray-200)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--ar-navy-900)] outline-none transition-colors placeholder:text-[var(--ar-navy-500)]/60 focus:border-[var(--ar-green-600)] focus:ring-2 focus:ring-[var(--ar-green-600)]/20"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "Ocultar contrasena" : "Mostrar contrasena"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--ar-navy-500)] transition-colors hover:bg-[var(--ar-gray-100)] hover:text-[var(--ar-navy-900)]"
        >
          {show ? (
            <EyeOff className="h-4 w-4" strokeWidth={2.25} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={2.25} />
          )}
        </button>
      </div>
    </label>
  );
}
