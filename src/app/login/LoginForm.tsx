"use client";

import { useActionState } from "react";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { Field } from "@/components/auth/Field";
import { loginUsuario, type LoginState } from "./actions";

const INITIAL: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUsuario, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />

      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.25} />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="ar-bg-green-gradient mt-2 flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.5} />
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
