"use client";

import { LogOut } from "lucide-react";
import { logoutUsuario } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logoutUsuario}>
      <button
        type="submit"
        title="Cerrar sesion"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ar-blue-300)]/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </form>
  );
}
