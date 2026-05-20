import { Dificultad } from "@/generated/prisma";

/**
 * Parametros base de tiempo y bonificaciones.
 */
export const TIEMPO_LIMITE_SEG = 30;
export const SPEED_BONUS_SEG = 7;

export const XP_BASE = 10;
export const XP_SPEED_BONUS = 5;

export const MONEDAS_BASE = 5;
export const GEMAS_POR_RACHA_O_SPEED = 1;

const DIF_MULTIPLIER: Record<Dificultad, number> = {
  FACIL: 1,
  MEDIO: 1.5,
  DIFICIL: 2,
};

export interface ResultadoRespuesta {
  esCorrecta: boolean;
  xpGanado: number;
  monedasGanadas: number;
  gemasGanadas: number;
  speedBonus: boolean;
  nuevaRacha: number;
}

interface CalcularInput {
  esCorrecta: boolean;
  tiempoSeg: number;
  dificultad: Dificultad;
  rachaPrevia: number;
}

export function calcularResultado(input: CalcularInput): ResultadoRespuesta {
  const { esCorrecta, tiempoSeg, dificultad, rachaPrevia } = input;

  if (!esCorrecta) {
    return {
      esCorrecta: false,
      xpGanado: 0,
      monedasGanadas: 0,
      gemasGanadas: 0,
      speedBonus: false,
      nuevaRacha: 0,
    };
  }

  const speedBonus = tiempoSeg <= SPEED_BONUS_SEG;
  const nuevaRacha = rachaPrevia + 1;
  const mult = DIF_MULTIPLIER[dificultad];

  // XP: base + speed + racha cap 10, todo multiplicado por dificultad
  const xpBruto = XP_BASE + (speedBonus ? XP_SPEED_BONUS : 0) + Math.min(nuevaRacha, 10);
  const xpGanado = Math.round(xpBruto * mult);

  const monedasGanadas = Math.round(MONEDAS_BASE * mult);
  const gemasGanadas =
    speedBonus || nuevaRacha >= 3 ? GEMAS_POR_RACHA_O_SPEED : 0;

  return {
    esCorrecta: true,
    xpGanado,
    monedasGanadas,
    gemasGanadas,
    speedBonus,
    nuevaRacha,
  };
}

/**
 * Dado un XP total acumulado, determina la etapa correspondiente.
 * etapas debe venir ordenada por xpRequerido ASC.
 */
export function determinarEtapaPorXP(
  xpTotal: number,
  etapas: { id: number; xpRequerido: number }[]
): number {
  let etapa = 0;
  for (const e of etapas) {
    if (xpTotal >= e.xpRequerido) etapa = e.id;
    else break;
  }
  return etapa;
}
