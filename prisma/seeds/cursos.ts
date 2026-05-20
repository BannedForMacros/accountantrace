import "dotenv/config";
import path from "node:path";
import * as XLSX from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const XLSX_PATH = path.resolve(
  process.cwd(),
  "Cursos del Plan de Estudios del Programa de Contabilidad y sus sumillas.xlsx"
);

/**
 * Mapea cada ciclo academico a la etapa minima del juego.
 * Logica: a medida que el estudiante avanza en ciclos, accede a contenido
 * de etapas mas altas en AccountantRace.
 */
function cicloToEtapaMinima(ciclo: number): number {
  if (ciclo <= 1) return 0; // Estudiante
  if (ciclo === 2) return 1; // Practicante
  if (ciclo === 3) return 2; // Auxiliar
  if (ciclo === 4 || ciclo === 5) return 3; // Analista Financiero
  if (ciclo === 6) return 4; // Contador Corporativo
  if (ciclo === 7) return 5; // Auditor Senior
  if (ciclo === 8) return 6; // Consultora Empresarial
  if (ciclo === 9) return 7; // Firma Internacional
  return 8; // ciclo 10 -> Bufete Elite
}

interface FilaCurso {
  numero: number;
  ciclo: number;
  nombre: string;
  sumilla: string;
}

function leerXlsx(): FilaCurso[] {
  const workbook = XLSX.readFile(XLSX_PATH);
  const hojaNombre = workbook.SheetNames[0];
  const hoja = workbook.Sheets[hojaNombre];
  const filas: Record<string, unknown>[] = XLSX.utils.sheet_to_json(hoja, {
    header: ["N", "CICLO", "NOMBRE", "SUMILLA"],
    range: 1, // saltar fila de encabezados
    defval: "",
  });

  const out: FilaCurso[] = [];
  for (const f of filas) {
    const numero = Number(f.N);
    const ciclo = Number(f.CICLO);
    const nombre = String(f.NOMBRE ?? "").trim();
    const sumilla = String(f.SUMILLA ?? "").trim();
    if (!numero || !ciclo || !nombre) continue;
    out.push({ numero, ciclo, nombre, sumilla });
  }
  return out;
}

async function main() {
  console.log(`Leyendo: ${XLSX_PATH}`);
  const cursos = leerXlsx();
  console.log(`Filas encontradas: ${cursos.length}\n`);

  let nuevos = 0;
  let actualizados = 0;

  for (const c of cursos) {
    const esElectivo = /ELECTIVO/i.test(c.nombre);
    const etapaMinima = cicloToEtapaMinima(c.ciclo);
    // normaliza nombre quitando "( ELECTIVO I )" etc para mostrar mas limpio,
    // pero conservamos el original tal cual lo trae el plan de estudios
    const data = {
      numero: c.numero,
      ciclo: c.ciclo,
      nombre: c.nombre,
      sumilla: c.sumilla,
      esElectivo,
      etapaMinima,
    };

    const existing = await prisma.curso.findUnique({
      where: { numero: c.numero },
    });
    if (existing) {
      await prisma.curso.update({ where: { numero: c.numero }, data });
      actualizados++;
    } else {
      await prisma.curso.create({ data });
      nuevos++;
    }
    const marker = esElectivo ? " (ELECTIVO)" : "";
    console.log(
      `  [${String(c.numero).padStart(2, "0")}] C${c.ciclo} -> E${etapaMinima}  ${c.nombre}${marker}`
    );
  }

  console.log(`\nOK - ${nuevos} nuevos, ${actualizados} actualizados.`);

  // Resumen por ciclo
  const porCiclo = await prisma.curso.groupBy({
    by: ["ciclo"],
    _count: { _all: true },
    orderBy: { ciclo: "asc" },
  });
  console.log("\nResumen por ciclo:");
  for (const r of porCiclo) {
    console.log(`  Ciclo ${r.ciclo}: ${r._count._all} cursos`);
  }

  const electivos = await prisma.curso.count({ where: { esElectivo: true } });
  console.log(`\nElectivos: ${electivos}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
