/**
 * Catalogo estatico de logros. Cada uno tiene una funcion `condicion`
 * que evalua si el usuario lo cumple en base a sus stats actuales.
 */

export interface LogroCondicionInput {
  xpTotal: number;
  rachaMaxima: number;
  etapaActual: number;
  totalCorrectas: number;
  speedBonusEnPartida: number;
  rachaMaxEnPartida: number;
  totalPreguntasEnPartida: number;
  totalCorrectasEnPartida: number;
}

export interface LogroDef {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string; // nombre de icono lucide
  xpRecompensa: number;
  condicion: (i: LogroCondicionInput) => boolean;
}

export const LOGROS_CATALOG: LogroDef[] = [
  {
    codigo: "primera_victoria",
    nombre: "Primera victoria",
    descripcion: "Responde tu primera pregunta correctamente.",
    icono: "Sparkles",
    xpRecompensa: 10,
    condicion: (i) => i.totalCorrectas >= 1,
  },
  {
    codigo: "racha_5",
    nombre: "Racha caliente",
    descripcion: "Alcanza una racha de 5 respuestas correctas seguidas.",
    icono: "Flame",
    xpRecompensa: 20,
    condicion: (i) => i.rachaMaxima >= 5,
  },
  {
    codigo: "racha_10",
    nombre: "Imparable",
    descripcion: "Encadena 10 respuestas correctas seguidas.",
    icono: "Zap",
    xpRecompensa: 50,
    condicion: (i) => i.rachaMaxima >= 10,
  },
  {
    codigo: "xp_100",
    nombre: "Primeros 100 XP",
    descripcion: "Acumula 100 XP en tu carrera.",
    icono: "TrendingUp",
    xpRecompensa: 10,
    condicion: (i) => i.xpTotal >= 100,
  },
  {
    codigo: "xp_1000",
    nombre: "Mil puntos",
    descripcion: "Llega a 1,000 XP totales.",
    icono: "TrendingUp",
    xpRecompensa: 50,
    condicion: (i) => i.xpTotal >= 1000,
  },
  {
    codigo: "xp_10000",
    nombre: "Veterano",
    descripcion: "Acumula 10,000 XP en total.",
    icono: "Trophy",
    xpRecompensa: 200,
    condicion: (i) => i.xpTotal >= 10000,
  },
  {
    codigo: "etapa_1",
    nombre: "Practicante",
    descripcion: "Desbloquea la etapa de Practicante Contable.",
    icono: "Award",
    xpRecompensa: 25,
    condicion: (i) => i.etapaActual >= 1,
  },
  {
    codigo: "etapa_5",
    nombre: "Auditor en formacion",
    descripcion: "Alcanza la etapa de Auditor Senior.",
    icono: "Medal",
    xpRecompensa: 100,
    condicion: (i) => i.etapaActual >= 5,
  },
  {
    codigo: "etapa_8",
    nombre: "Campeon AccountantRace",
    descripcion: "Llega a la maxima etapa: Bufete Contable Elite.",
    icono: "Crown",
    xpRecompensa: 500,
    condicion: (i) => i.etapaActual >= 8,
  },
  {
    codigo: "perfecto",
    nombre: "Sin fallar",
    descripcion: "Completa una partida acertando todas las preguntas.",
    icono: "CheckCircle2",
    xpRecompensa: 50,
    condicion: (i) =>
      i.totalPreguntasEnPartida > 0 &&
      i.totalCorrectasEnPartida === i.totalPreguntasEnPartida,
  },
  {
    codigo: "speed_demon",
    nombre: "Speed demon",
    descripcion: "Logra 5 speed bonus en una sola partida.",
    icono: "Zap",
    xpRecompensa: 40,
    condicion: (i) => i.speedBonusEnPartida >= 5,
  },
  {
    codigo: "racha_partida_10",
    nombre: "Concentracion total",
    descripcion: "Logra una racha de 10 en una sola partida.",
    icono: "Flame",
    xpRecompensa: 30,
    condicion: (i) => i.rachaMaxEnPartida >= 10,
  },
];
