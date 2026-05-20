"use client";

import { useActionState, useState } from "react";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  PersonStanding,
  CircleUserRound,
} from "lucide-react";
import { Field } from "@/components/auth/Field";
import { registrarUsuario, type RegistroState } from "./actions";

const INITIAL: RegistroState = {};

export function RegistroForm() {
  const [genero, setGenero] = useState<"HOMBRE" | "MUJER" | null>(null);
  const [state, formAction, pending] = useActionState(
    registrarUsuario,
    INITIAL
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Nombre"
          Icon={User}
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="given-name"
          placeholder="Juan"
          required
        />
        <Field
          label="Apellidos"
          id="apellidos"
          name="apellidos"
          type="text"
          autoComplete="family-name"
          placeholder="Perez"
          required
        />
      </div>

      <Field
        label="Email"
        Icon={Mail}
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        required
      />
      <Field
        label="Contrasena"
        Icon={Lock}
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Minimo 6 caracteres"
        required
        minLength={6}
      />

      {/* Genero */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--ar-navy-700)]">
          Genero
        </span>
        <p className="mb-2 text-[11px] text-[var(--ar-navy-500)]">
          Determina el avatar que veras en cada etapa.
        </p>
        <input type="hidden" name="genero" value={genero ?? ""} />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGenero("HOMBRE")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
              genero === "HOMBRE"
                ? "border-[var(--ar-green-600)] bg-[var(--ar-green-600)]/10 text-[var(--ar-green-600)]"
                : "border-[var(--ar-gray-200)] bg-white text-[var(--ar-navy-700)] hover:border-[var(--ar-navy-500)]"
            }`}
          >
            <PersonStanding className="h-5 w-5" strokeWidth={2.25} />
            Hombre
          </button>
          <button
            type="button"
            onClick={() => setGenero("MUJER")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
              genero === "MUJER"
                ? "border-[var(--ar-green-600)] bg-[var(--ar-green-600)]/10 text-[var(--ar-green-600)]"
                : "border-[var(--ar-gray-200)] bg-white text-[var(--ar-navy-700)] hover:border-[var(--ar-navy-500)]"
            }`}
          >
            <CircleUserRound className="h-5 w-5" strokeWidth={2.25} />
            Mujer
          </button>
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.25} />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !genero}
        className="ar-bg-green-gradient mt-2 flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" strokeWidth={2.5} />
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
