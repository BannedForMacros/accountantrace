import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

/**
 * Hash una contrasena usando scrypt (nativo de Node, sin deps externas).
 * Formato: "<hex hash>:<hex salt>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}:${salt}`;
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  const [hashHex, salt] = hashed.split(":");
  if (!hashHex || !salt) return false;
  try {
    const hashBuffer = Buffer.from(hashHex, "hex");
    const computed = await scryptAsync(password, salt, 64);
    if (hashBuffer.length !== computed.length) return false;
    return timingSafeEqual(hashBuffer, computed);
  } catch {
    return false;
  }
}

/**
 * Devuelve el usuario logueado o null. No redirige.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await prisma.usuario.findUnique({
    where: { id: session.userId },
  });
  return user;
}

/**
 * Devuelve el usuario logueado o redirige a /login.
 * Usar en server components que requieren sesion.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
