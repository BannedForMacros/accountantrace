import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma";
import { xpMaximoReto, PREGUNTAS_POR_RETO } from "../../src/lib/scoring";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Catalogo estatico de las 9 etapas del juego.
 * Fuente: EVOLUCION EN CADA ETAPA.docx + mockups por sexo.
 *
 * El campo `xpRequerido` se RECALCULA dinamicamente al sembrar (ver
 * calcularUmbrales) en funcion de cuantos cursos se desbloquean en cada
 * etapa. Regla: para subir de la etapa k a la k+1 basta con completar
 * (cursos nuevos de la etapa k - 1) retos casi perfectos. Se deja un
 * margen de 1 reto: nunca hace falta completar TODOS para avanzar.
 * Los valores en el array son solo un fallback si aun no hay cursos en BD.
 */
const ETAPAS = [
  {
    id: 0,
    nombre: "Estudiante",
    titulo: "Inicio Absoluto - Oficina Vacia",
    descripcion:
      "Empiezas tu carrera contable en un cuarto pequeno con escritorio basico y laptop sencilla. Responde preguntas, gana XP y construye tu oficina profesional paso a paso.",
    porcentajeMin: 0,
    xpRequerido: 0,
    imagenHombre: "/escenarios/etapa0-hombre.jpeg",
    imagenMujer: "/escenarios/etapa0-mujer.jpeg",
    recompensaMonedas: 0,
    recompensaGemas: 0,
    medalla: null,
  },
  {
    id: 1,
    nombre: "Practicante Contable",
    titulo: "Practicante Contable",
    descripcion:
      "Tu primer logro: aparecen lampara LED, calculadora financiera, cuaderno contable, taza corporativa y diplomas basicos. Brillo dorado de nivel desbloqueado.",
    porcentajeMin: 5,
    xpRequerido: 100,
    imagenHombre: "/escenarios/etapa1-hombre.jpeg",
    imagenMujer: "/escenarios/etapa1-mujer.jpeg",
    recompensaMonedas: 250,
    recompensaGemas: 25,
    medalla: null,
  },
  {
    id: 2,
    nombre: "Auxiliar Contable",
    titulo: "Auxiliar Contable",
    descripcion:
      "La oficina mejora con escritorio mas elegante, doble monitor, archivadores, impresora multifuncion, manual de contabilidad y reloj empresarial. El avatar gana ropa mas profesional.",
    porcentajeMin: 15,
    xpRequerido: 500,
    imagenHombre: "/escenarios/etapa2-hombre.jpeg",
    imagenMujer: "/escenarios/etapa2-mujer.jpeg",
    recompensaMonedas: 400,
    recompensaGemas: 40,
    medalla: null,
  },
  {
    id: 3,
    nombre: "Analista Financiero",
    titulo: "Analista Financiero",
    descripcion:
      "Se desbloquea biblioteca NIIF avanzada, tablet financiera, dashboard contable animado, graficos moviendose y monedas academicas flotantes.",
    porcentajeMin: 25,
    xpRequerido: 1500,
    imagenHombre: "/escenarios/etapa3-hombre.jpeg",
    imagenMujer: "/escenarios/etapa3-mujer.jpeg",
    recompensaMonedas: 650,
    recompensaGemas: 60,
    medalla: null,
  },
  {
    id: 4,
    nombre: "Contador Corporativo",
    titulo: "Contador Corporativo",
    descripcion:
      "Cambio fuerte visual: oficina moderna premium, logo AccountantRace en pared, diplomas grandes, clientes virtuales, panel financiero gigante. Fondo de ciudad empresarial moderna.",
    porcentajeMin: 40,
    xpRequerido: 3000,
    imagenHombre: "/escenarios/etapa4-hombre.jpeg",
    imagenMujer: "/escenarios/etapa4-mujer.jpeg",
    recompensaMonedas: 900,
    recompensaGemas: 90,
    medalla: null,
  },
  {
    id: 5,
    nombre: "Auditor Senior",
    titulo: "Auditor Senior",
    descripcion:
      "Sala de reuniones, asistentes IA, mesa ejecutiva, pantallas bursatiles, indicadores financieros animados y hologramas. Primera medalla de plata.",
    porcentajeMin: 55,
    xpRequerido: 5000,
    imagenHombre: "/escenarios/etapa5-hombre.jpeg",
    imagenMujer: "/escenarios/etapa5-mujer.jpeg",
    recompensaMonedas: 1200,
    recompensaGemas: 120,
    medalla: "plata",
  },
  {
    id: 6,
    nombre: "Consultora Empresarial",
    titulo: "Consultora Empresarial",
    descripcion:
      "Piso corporativo completo, recepcion empresarial, secretaria virtual, clientes esperando, areas tributaria y financiera. Torre empresarial moderna. Medalla de oro.",
    porcentajeMin: 70,
    xpRequerido: 12000,
    imagenHombre: "/escenarios/etapa6-hombre.jpeg",
    imagenMujer: "/escenarios/etapa6-mujer.jpeg",
    recompensaMonedas: 1800,
    recompensaGemas: 180,
    medalla: "oro",
  },
  {
    id: 7,
    nombre: "Firma Contable Internacional",
    titulo: "Firma Contable Internacional",
    descripcion:
      "Edificio corporativo propio, sala de juntas premium, equipo completo de contadores, sala de auditoria, centro financiero digital. Transicion cinematografica y musica corporativa. Medalla diamante.",
    porcentajeMin: 85,
    xpRequerido: 17000,
    imagenHombre: "/escenarios/etapa7-hombre.jpeg",
    imagenMujer: "/escenarios/etapa7-mujer.jpeg",
    recompensaMonedas: 2500,
    recompensaGemas: 250,
    medalla: "diamante",
  },
  {
    id: 8,
    nombre: "Bufete Contable Elite",
    titulo: "Bufete Contable Elite",
    descripcion:
      "Rascacielos corporativo, logo propio personalizado, bufete internacional, sala ejecutiva inteligente, clientes multinacionales, pantallas financieras globales, trofeo AccountantRace y skyline financiero nocturno. Campeon AccountantRace.",
    porcentajeMin: 100,
    xpRequerido: 21000,
    imagenHombre: "/escenarios/etapa8-hombre.jpeg",
    imagenMujer: "/escenarios/etapa8-mujer.jpeg",
    recompensaMonedas: 5000,
    recompensaGemas: 500,
    medalla: "elite",
  },
];

/**
 * Calcula el XP acumulado requerido por cada etapa a partir del numero de
 * cursos que se desbloquean en cada una. Para pasar de la etapa k a la k+1
 * se necesita completar (cursosNuevos[k] - 1) retos casi perfectos, con un
 * minimo de 1 reto. Devuelve un Map id -> xpRequerido, o null si aun no hay
 * cursos en BD (en cuyo caso se usan los valores estaticos del array).
 */
async function calcularUmbrales(): Promise<Map<number, number> | null> {
  const conteo = await prisma.curso.groupBy({
    by: ["etapaMinima"],
    _count: { _all: true },
  });

  const total = conteo.reduce((acc, r) => acc + r._count._all, 0);
  if (total === 0) return null;

  const cursosNuevos = new Map<number, number>();
  for (const r of conteo) cursosNuevos.set(r.etapaMinima, r._count._all);

  const xpPorReto = xpMaximoReto(PREGUNTAS_POR_RETO);
  const umbrales = new Map<number, number>();
  let acumulado = 0;
  umbrales.set(0, 0);
  for (let k = 0; k < 8; k++) {
    const nuevos = cursosNuevos.get(k) ?? 0;
    const retosNecesarios = Math.max(1, nuevos - 1);
    acumulado += retosNecesarios * xpPorReto;
    umbrales.set(k + 1, acumulado);
  }
  return umbrales;
}

async function main() {
  console.log("Sembrando etapas...");

  const umbrales = await calcularUmbrales();
  if (!umbrales) {
    console.warn(
      "  ! No hay cursos en BD: usando umbrales estaticos. Corre seed:cursos y vuelve a sembrar etapas."
    );
  }

  for (const etapa of ETAPAS) {
    const xpRequerido = umbrales?.get(etapa.id) ?? etapa.xpRequerido;
    const data = { ...etapa, xpRequerido };
    await prisma.etapa.upsert({
      where: { id: etapa.id },
      update: data,
      create: data,
    });
    console.log(
      `  [${etapa.id}] ${etapa.nombre} - ${xpRequerido.toLocaleString("es-PE")} XP`
    );
  }

  const total = await prisma.etapa.count();
  console.log(`\nOK - ${total} etapas en BD.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
