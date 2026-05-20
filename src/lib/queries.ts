import { prisma } from "@/lib/prisma";

export async function getEtapa(id: number) {
  return prisma.etapa.findUnique({ where: { id } });
}

export async function getAllEtapas() {
  return prisma.etapa.findMany({ orderBy: { id: "asc" } });
}

export async function getCursosByEtapa(etapaMinima: number) {
  return prisma.curso.findMany({
    where: { etapaMinima },
    orderBy: { numero: "asc" },
  });
}

export async function countPreguntasByEtapa(etapa: number) {
  return prisma.pregunta.count({ where: { etapa } });
}
