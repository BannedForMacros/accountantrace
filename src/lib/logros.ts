import { prisma } from "@/lib/prisma";
import {
  LOGROS_CATALOG,
  type LogroCondicionInput,
} from "@/lib/logros-catalog";

/**
 * Evalua todos los logros y otorga los que el usuario haya cumplido y no tenga aun.
 * Devuelve la lista de logros recien desbloqueados.
 */
export async function evaluarLogros(
  usuarioId: string,
  ctx: LogroCondicionInput
): Promise<{ codigo: string; nombre: string; icono: string; xpRecompensa: number }[]> {
  // Logros que cumple ahora
  const cumplidos = LOGROS_CATALOG.filter((l) => l.condicion(ctx));
  if (cumplidos.length === 0) return [];

  // Cuales ya tiene
  const codigos = cumplidos.map((l) => l.codigo);
  const logrosBD = await prisma.logro.findMany({
    where: { codigo: { in: codigos } },
    select: { id: true, codigo: true, nombre: true, icono: true, xpRecompensa: true },
  });
  const yaTiene = await prisma.usuarioLogro.findMany({
    where: { usuarioId, logroId: { in: logrosBD.map((l) => l.id) } },
    select: { logroId: true },
  });
  const yaTieneSet = new Set(yaTiene.map((u) => u.logroId));

  const nuevos = logrosBD.filter((l) => !yaTieneSet.has(l.id));
  if (nuevos.length === 0) return [];

  // Crear registros + sumar XP
  let xpExtra = 0;
  for (const l of nuevos) {
    xpExtra += l.xpRecompensa;
    await prisma.usuarioLogro.create({
      data: { usuarioId, logroId: l.id },
    });
  }
  if (xpExtra > 0) {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { xpTotal: { increment: xpExtra } },
    });
  }
  return nuevos;
}
