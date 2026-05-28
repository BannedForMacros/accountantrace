/**
 * Parametros base de tiempo, XP y bonificaciones.
 *
 * Modelo de puntaje (simple y predecible):
 *   - Cada respuesta correcta vale XP_BASE.
 *   - Un reto tiene como maximo PREGUNTAS_POR_RETO preguntas.
 *   - Al cerrar la partida, la mejor racha alcanzada otorga un bonus
 *     de XP_RACHA_POR_NIVEL por nivel, hasta XP_RACHA_BONUS_MAX.
 *
 * => Reto perfecto de 10 preguntas: 10 x 10 + 20 = 120 XP maximo.
 */
export const TIEMPO_LIMITE_SEG = 30;
export const SPEED_BONUS_SEG = 7;

export const PREGUNTAS_POR_RETO = 10;

export const XP_BASE = 10;
export const XP_RACHA_POR_NIVEL = 2;
export const XP_RACHA_BONUS_MAX = 20;

export const MONEDAS_BASE = 5;
export const GEMAS_POR_RACHA_O_SPEED = 1;

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
  rachaPrevia: number;
}

export function calcularResultado(input: CalcularInput): ResultadoRespuesta {
  const { esCorrecta, tiempoSeg, rachaPrevia } = input;

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

  // El XP base es fijo por acierto; el bonus de racha se aplica al cerrar
  // la partida (ver bonusRacha). El speed solo otorga gemas.
  const gemasGanadas =
    speedBonus || nuevaRacha >= 3 ? GEMAS_POR_RACHA_O_SPEED : 0;

  return {
    esCorrecta: true,
    xpGanado: XP_BASE,
    monedasGanadas: MONEDAS_BASE,
    gemasGanadas,
    speedBonus,
    nuevaRacha,
  };
}

/** Bonus de XP segun la mejor racha alcanzada en una partida. */
export function bonusRacha(rachaMax: number): number {
  return Math.min(rachaMax * XP_RACHA_POR_NIVEL, XP_RACHA_BONUS_MAX);
}

/**
 * XP maximo que puede dar un reto de `numPreguntas` preguntas:
 * todas correctas (base) + racha perfecta (bonus).
 */
export function xpMaximoReto(numPreguntas: number): number {
  const n = Math.max(0, Math.min(numPreguntas, PREGUNTAS_POR_RETO));
  return n * XP_BASE + bonusRacha(n);
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
