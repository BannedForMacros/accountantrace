"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { calcularResultado, determinarEtapaPorXP } from "@/lib/scoring";
import { Dificultad } from "@/generated/prisma";

export interface RespuestaCliente {
  preguntaId: string;
  alternativaSeleccionada: number; // -1 = no respondio (tiempo agotado)
  tiempoSeg: number;
}

export interface ResultadoFinal {
  partidaId: string;
  totalPreguntas: number;
  totalCorrectas: number;
  puntajeFinal: number;
  xpAntes: number;
  xpDespues: number;
  monedasGanadas: number;
  gemasGanadas: number;
  rachaMaxPartida: number;
  etapaAntes: number;
  etapaDespues: number;
  subioEtapa: boolean;
  precisionPct: number;
  detalle: {
    preguntaId: string;
    esCorrecta: boolean;
    xpGanado: number;
    speedBonus: boolean;
  }[];
}

interface InputFinalizar {
  cursoId: number;
  etapa: number;
  respuestas: RespuestaCliente[];
}

export async function finalizarPartida(
  input: InputFinalizar
): Promise<ResultadoFinal> {
  const usuario = await requireUser();

  // Cargar las preguntas reales para validar (no confiar en cliente)
  const preguntaIds = input.respuestas.map((r) => r.preguntaId);
  const preguntas = await prisma.pregunta.findMany({
    where: { id: { in: preguntaIds } },
  });
  const preguntaPorId = new Map(preguntas.map((p) => [p.id, p]));

  // Crear partida
  const partida = await prisma.partida.create({
    data: {
      usuarioId: usuario.id,
      cursoId: input.cursoId,
      etapa: input.etapa,
      totalPreguntas: input.respuestas.length,
    },
  });

  let totalCorrectas = 0;
  let xpAcumulado = 0;
  let monedasAcum = 0;
  let gemasAcum = 0;
  let rachaActual = 0;
  let rachaMaxPartida = 0;
  let tiempoTotal = 0;

  const detalle: ResultadoFinal["detalle"] = [];

  for (const r of input.respuestas) {
    const p = preguntaPorId.get(r.preguntaId);
    if (!p) continue;

    const esCorrecta =
      r.alternativaSeleccionada >= 0 &&
      r.alternativaSeleccionada === p.correctaIdx;

    const res = calcularResultado({
      esCorrecta,
      tiempoSeg: r.tiempoSeg,
      dificultad: p.dificultad as Dificultad,
      rachaPrevia: rachaActual,
    });

    rachaActual = res.nuevaRacha;
    rachaMaxPartida = Math.max(rachaMaxPartida, rachaActual);
    if (esCorrecta) totalCorrectas++;
    xpAcumulado += res.xpGanado;
    monedasAcum += res.monedasGanadas;
    gemasAcum += res.gemasGanadas;
    tiempoTotal += r.tiempoSeg;

    await prisma.respuesta.create({
      data: {
        usuarioId: usuario.id,
        preguntaId: p.id,
        partidaId: partida.id,
        alternativaSeleccionada: r.alternativaSeleccionada,
        esCorrecta,
        tiempoSeg: r.tiempoSeg,
        speedBonus: res.speedBonus,
        xpGanado: res.xpGanado,
      },
    });

    detalle.push({
      preguntaId: p.id,
      esCorrecta,
      xpGanado: res.xpGanado,
      speedBonus: res.speedBonus,
    });
  }

  // Actualizar partida con cierre
  await prisma.partida.update({
    where: { id: partida.id },
    data: {
      finalizadaEn: new Date(),
      totalCorrectas,
      puntajeFinal: xpAcumulado,
      tiempoTotalSeg: tiempoTotal,
      rachaMaxPartida,
    },
  });

  // Actualizar usuario
  const etapas = await prisma.etapa.findMany({
    orderBy: { id: "asc" },
    select: { id: true, xpRequerido: true },
  });
  const xpAntes = usuario.xpTotal;
  const xpDespues = xpAntes + xpAcumulado;
  const etapaAntes = usuario.etapaActual;
  const etapaDespues = determinarEtapaPorXP(xpDespues, etapas);

  // Para etapa 1: regla especial = 5 preguntas correctas si aun esta en etapa 0
  // (segun doc fuente)
  const totalCorrectasUsuario = await prisma.respuesta.count({
    where: { usuarioId: usuario.id, esCorrecta: true },
  });
  const etapaConRegla5 =
    etapaAntes === 0 && totalCorrectasUsuario >= 5 && etapaDespues < 1
      ? 1
      : etapaDespues;

  // Recalcular precision global
  const totalRespsUsuario = await prisma.respuesta.count({
    where: { usuarioId: usuario.id },
  });
  const precision =
    totalRespsUsuario > 0 ? (totalCorrectasUsuario / totalRespsUsuario) * 100 : 0;

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      xpTotal: xpDespues,
      monedas: usuario.monedas + monedasAcum,
      gemas: usuario.gemas + gemasAcum,
      rachaActual,
      rachaMaxima: Math.max(usuario.rachaMaxima, rachaMaxPartida),
      precision,
      etapaActual: etapaConRegla5,
    },
  });

  // Actualizar progreso por curso
  await prisma.progreso.upsert({
    where: {
      usuarioId_cursoId: { usuarioId: usuario.id, cursoId: input.cursoId },
    },
    update: {
      preguntasResp: { increment: input.respuestas.length },
      preguntasCorrectas: { increment: totalCorrectas },
      xpAcumulado: { increment: xpAcumulado },
    },
    create: {
      usuarioId: usuario.id,
      cursoId: input.cursoId,
      preguntasResp: input.respuestas.length,
      preguntasCorrectas: totalCorrectas,
      xpAcumulado,
    },
  });

  revalidatePath("/");
  revalidatePath("/retos");

  const subioEtapa = etapaConRegla5 > etapaAntes;
  const precisionPct =
    input.respuestas.length > 0
      ? (totalCorrectas / input.respuestas.length) * 100
      : 0;

  return {
    partidaId: partida.id,
    totalPreguntas: input.respuestas.length,
    totalCorrectas,
    puntajeFinal: xpAcumulado,
    xpAntes,
    xpDespues,
    monedasGanadas: monedasAcum,
    gemasGanadas: gemasAcum,
    rachaMaxPartida,
    etapaAntes,
    etapaDespues: etapaConRegla5,
    subioEtapa,
    precisionPct,
    detalle,
  };
}
