import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizClient, type PreguntaJuego } from "./QuizClient";

interface Props {
  params: Promise<{ cursoId: string }>;
}

async function getPreguntasAleatorias(
  cursoId: number,
  cantidad: number
): Promise<PreguntaJuego[]> {
  const todas = await prisma.pregunta.findMany({
    where: { cursoId },
    orderBy: { vecesUsada: "asc" },
  });
  const arr = [...todas];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const elegidas = arr.slice(0, cantidad);
  return elegidas.map((p) => ({
    id: p.id,
    enunciado: p.enunciado,
    alternativas: p.alternativas as string[],
    correctaIdx: p.correctaIdx,
    explicacion: p.explicacion ?? "",
    dificultad: p.dificultad,
  }));
}

export default async function RetoCursoPage({ params }: Props) {
  const { cursoId: cursoIdStr } = await params;
  const cursoId = Number(cursoIdStr);
  if (!Number.isFinite(cursoId)) notFound();

  const usuario = await requireUser();
  const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) notFound();

  if (curso.etapaMinima > usuario.etapaActual) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060E1A] p-6">
        <div className="game-card max-w-md p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-[var(--ar-orange-500)]" />
          <h2 className="mt-3 text-lg font-bold text-white">
            Curso bloqueado
          </h2>
          <p className="mt-1 text-sm text-[var(--ar-blue-300)]/50">
            Este curso requiere la etapa {curso.etapaMinima}. Tu etapa actual es {usuario.etapaActual}.
          </p>
          <Link
            href="/retos"
            className="game-btn game-btn-secondary mt-4 inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a Retos
          </Link>
        </div>
      </div>
    );
  }

  const preguntas = await getPreguntasAleatorias(cursoId, 10);

  if (preguntas.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060E1A] p-6">
        <div className="game-card max-w-md p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-[var(--ar-orange-500)]" />
          <h2 className="mt-3 text-lg font-bold text-white">
            Sin preguntas disponibles
          </h2>
          <p className="mt-1 text-sm text-[var(--ar-blue-300)]/50">
            Este curso aun no tiene preguntas generadas.
          </p>
          <Link
            href="/retos"
            className="game-btn game-btn-secondary mt-4 inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a Retos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <QuizClient
      curso={{
        id: curso.id,
        nombre: curso.nombre,
        ciclo: curso.ciclo,
        etapaMinima: curso.etapaMinima,
      }}
      preguntas={preguntas}
    />
  );
}
