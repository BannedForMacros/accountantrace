import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Catalogo estatico de las 9 etapas del juego.
 * Fuente: EVOLUCION EN CADA ETAPA.docx + mockups por sexo.
 *
 * Umbrales:
 *   Etapa 0 = inicio
 *   Etapa 1 = 5 preguntas bien respondidas (especial)
 *   Etapa 2 = 15%
 *   Etapa 3 = 25%
 *   Etapa 4 = 40%
 *   Etapa 5 = 55%
 *   Etapa 6 = 70%
 *   Etapa 7 = 85%
 *   Etapa 8 = 100%
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

async function main() {
  console.log("Sembrando etapas...");

  for (const etapa of ETAPAS) {
    await prisma.etapa.upsert({
      where: { id: etapa.id },
      update: etapa,
      create: etapa,
    });
    console.log(`  [${etapa.id}] ${etapa.nombre} - ${etapa.porcentajeMin}%`);
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
