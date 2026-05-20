import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Dificultad } from "../../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const PREGUNTAS_POR_CURSO = 10;

if (!apiKey) {
  console.error(
    "ERROR: GEMINI_API_KEY no esta configurada en .env. Pegala y reintenta."
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: modelName,
  generationConfig: {
    temperature: 0.7,
    responseMimeType: "application/json",
  },
});

/**
 * Distribucion de dificultad segun la etapa del juego (10 preguntas).
 */
function distribucionDificultad(
  etapa: number
): { facil: number; medio: number; dificil: number } {
  if (etapa <= 2) return { facil: 7, medio: 3, dificil: 0 };
  if (etapa <= 5) return { facil: 2, medio: 6, dificil: 2 };
  return { facil: 1, medio: 4, dificil: 5 };
}

function buildPrompt(curso: {
  nombre: string;
  ciclo: number;
  sumilla: string;
  etapaMinima: number;
}): string {
  const dist = distribucionDificultad(curso.etapaMinima);
  return `Eres un experto en ciencias contables peruanas y educacion universitaria. Vas a generar preguntas de opcion multiple para un quiz educativo gamificado llamado AccountantRace.

CONTEXTO DEL CURSO:
- Nombre: ${curso.nombre}
- Ciclo academico: ${curso.ciclo}
- Etapa del juego: ${curso.etapaMinima} (0=basico estudiante, 8=experto elite)
- Sumilla del curso:
${curso.sumilla}

REQUISITOS:
1. Genera EXACTAMENTE ${PREGUNTAS_POR_CURSO} preguntas de opcion multiple con 4 alternativas cada una.
2. Distribucion de dificultad:
   - FACIL: ${dist.facil} preguntas
   - MEDIO: ${dist.medio} preguntas
   - DIFICIL: ${dist.dificil} preguntas
3. Contexto peruano: usa referencias a SUNAT, PCGE, NIIF/NIC vigentes en Peru, SBS, SMV, Codigo Tributario peruano, Ley General de Sociedades, leyes laborales peruanas cuando aplique.
4. Las preguntas deben evaluar los conocimientos Y habilidades descritos en la sumilla.
5. Solo UNA alternativa debe ser correcta. Las otras 3 deben ser plausibles (distractores reales) pero claramente incorrectas para alguien que sabe.
6. La explicacion debe ser breve (1-2 oraciones) y didactica.

FORMATO DE SALIDA (JSON estricto):
{
  "preguntas": [
    {
      "enunciado": "texto de la pregunta",
      "alternativas": ["opcion A", "opcion B", "opcion C", "opcion D"],
      "correctaIdx": 0,
      "explicacion": "breve explicacion",
      "conceptosClave": ["concepto1", "concepto2"],
      "dificultad": "FACIL"
    }
  ]
}

IMPORTANTE: responde SOLO el JSON valido, sin markdown ni texto adicional. correctaIdx es 0, 1, 2 o 3. dificultad es exactamente "FACIL", "MEDIO" o "DIFICIL".`;
}

interface PreguntaIA {
  enunciado: string;
  alternativas: string[];
  correctaIdx: number;
  explicacion: string;
  conceptosClave: string[];
  dificultad: "FACIL" | "MEDIO" | "DIFICIL";
}

function validarPregunta(p: unknown): p is PreguntaIA {
  if (!p || typeof p !== "object") return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj.enunciado === "string" &&
    Array.isArray(obj.alternativas) &&
    obj.alternativas.length === 4 &&
    obj.alternativas.every((a) => typeof a === "string") &&
    typeof obj.correctaIdx === "number" &&
    obj.correctaIdx >= 0 &&
    obj.correctaIdx <= 3 &&
    typeof obj.explicacion === "string" &&
    Array.isArray(obj.conceptosClave) &&
    typeof obj.dificultad === "string" &&
    ["FACIL", "MEDIO", "DIFICIL"].includes(obj.dificultad)
  );
}

async function generarParaCurso(curso: {
  id: number;
  numero: number;
  nombre: string;
  ciclo: number;
  sumilla: string;
  etapaMinima: number;
}): Promise<number> {
  const prompt = buildPrompt(curso);
  const result = await model.generateContent(prompt);
  const texto = result.response.text();

  let parsed: { preguntas: unknown[] };
  try {
    parsed = JSON.parse(texto);
  } catch {
    // a veces el modelo aun envuelve en bloques de codigo
    const sinFence = texto
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    parsed = JSON.parse(sinFence);
  }

  if (!parsed.preguntas || !Array.isArray(parsed.preguntas)) {
    throw new Error("Respuesta sin campo 'preguntas'");
  }

  let guardadas = 0;
  for (const p of parsed.preguntas) {
    if (!validarPregunta(p)) {
      console.warn(`    !! Pregunta invalida descartada en curso ${curso.numero}`);
      continue;
    }
    await prisma.pregunta.create({
      data: {
        cursoId: curso.id,
        enunciado: p.enunciado,
        alternativas: p.alternativas,
        correctaIdx: p.correctaIdx,
        explicacion: p.explicacion,
        conceptosClave: p.conceptosClave,
        dificultad: p.dificultad as Dificultad,
        etapa: curso.etapaMinima,
        generadaPorIA: true,
        modeloIA: modelName,
      },
    });
    guardadas++;
  }
  return guardadas;
}

async function main() {
  console.log(`Modelo: ${modelName}`);
  console.log(`Preguntas por curso: ${PREGUNTAS_POR_CURSO}\n`);

  const cursos = await prisma.curso.findMany({
    orderBy: { numero: "asc" },
  });

  let totalGeneradas = 0;
  let cursosSaltados = 0;
  let cursosOk = 0;
  let cursosError = 0;

  for (const curso of cursos) {
    const yaExisten = await prisma.pregunta.count({
      where: { cursoId: curso.id },
    });
    if (yaExisten >= PREGUNTAS_POR_CURSO) {
      console.log(
        `  [${String(curso.numero).padStart(2, "0")}] ${curso.nombre.slice(0, 50)} - ya tiene ${yaExisten} preguntas, salto.`
      );
      cursosSaltados++;
      continue;
    }

    process.stdout.write(
      `  [${String(curso.numero).padStart(2, "0")}] ${curso.nombre.slice(0, 50)}... `
    );
    try {
      const n = await generarParaCurso(curso);
      console.log(`OK (${n} preguntas)`);
      totalGeneradas += n;
      cursosOk++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg.slice(0, 80)}`);
      cursosError++;
    }

    // pausa breve para evitar rate-limit
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n========== RESUMEN ==========`);
  console.log(`Cursos procesados: ${cursosOk}`);
  console.log(`Cursos saltados (ya tenian): ${cursosSaltados}`);
  console.log(`Cursos con error: ${cursosError}`);
  console.log(`Preguntas generadas en esta corrida: ${totalGeneradas}`);

  const totalEnBD = await prisma.pregunta.count();
  console.log(`Preguntas totales en BD: ${totalEnBD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
