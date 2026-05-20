"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { Genero } from "@/generated/prisma";

export interface RegistroState {
  error?: string;
}

const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export async function registrarUsuario(
  _prev: RegistroState,
  formData: FormData
): Promise<RegistroState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const generoRaw = String(formData.get("genero") ?? "");

  if (!nombre || !apellidos || !email || !password || !generoRaw) {
    return { error: "Completa todos los campos." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "El email no tiene un formato valido." };
  }
  if (password.length < 6) {
    return { error: "La contrasena debe tener al menos 6 caracteres." };
  }
  if (generoRaw !== "HOMBRE" && generoRaw !== "MUJER") {
    return { error: "Selecciona un genero valido." };
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    return { error: "Ya existe una cuenta con ese email." };
  }

  const passwordHash = await hashPassword(password);
  const usuario = await prisma.usuario.create({
    data: {
      email,
      passwordHash,
      nombre,
      apellidos,
      genero: generoRaw as Genero,
    },
  });

  const session = await getSession();
  session.userId = usuario.id;
  await session.save();

  redirect("/");
}
