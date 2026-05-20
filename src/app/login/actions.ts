"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";

export interface LoginState {
  error?: string;
}

export async function loginUsuario(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa email y contrasena." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return { error: "Credenciales invalidas." };
  }

  const ok = await verifyPassword(password, usuario.passwordHash);
  if (!ok) {
    return { error: "Credenciales invalidas." };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoLogin: new Date() },
  });

  const session = await getSession();
  session.userId = usuario.id;
  await session.save();

  redirect("/");
}

export async function logoutUsuario() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
