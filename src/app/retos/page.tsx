import Link from "next/link";
import { Play, BookOpen, Lock, Target, AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { BottomNav } from "@/components/hud/BottomNav";

export default async function RetosPage() {
  const usuario = await requireUser();
  const etapa = await getEtapa(usuario.etapaActual);
  if (!etapa) return null;

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;

  // Cursos accesibles: todos los de etapaMinima <= etapaActual
  const cursos = await prisma.curso.findMany({
    where: { etapaMinima: { lte: usuario.etapaActual } },
    orderBy: [{ etapaMinima: "asc" }, { numero: "asc" }],
  });

  // Conteo de preguntas por curso
  const preguntasPorCurso = await prisma.pregunta.groupBy({
    by: ["cursoId"],
    _count: { _all: true },
  });
  const conteoMap = new Map(
    preguntasPorCurso.map((p) => [p.cursoId, p._count._all])
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        nivel={etapa.id}
        xpActual={usuario.xpTotal}
        xpMeta={xpMeta}
        monedas={usuario.monedas}
        gemas={usuario.gemas}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="ar-bg-green-gradient flex h-10 w-10 items-center justify-center rounded-lg shadow-lg">
            <Target className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--ar-navy-900)]">
              Retos disponibles
            </h1>
            <p className="text-sm text-[var(--ar-navy-500)]">
              {cursos.length} cursos accesibles segun tu etapa actual
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => {
            const totalPreg = conteoMap.get(c.id) ?? 0;
            const sinPreg = totalPreg === 0;

            return (
              <article
                key={c.id}
                className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                  sinPreg
                    ? "border-[var(--ar-gray-200)] opacity-60"
                    : "border-[var(--ar-gray-200)] hover:border-[var(--ar-green-600)]/40 hover:shadow-md"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ar-navy-900)]/5 px-2 py-0.5 text-[10px] font-bold text-[var(--ar-navy-700)]">
                      C{c.ciclo}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ar-green-600)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--ar-green-600)]">
                      Etapa {c.etapaMinima}
                    </span>
                    {c.esElectivo && (
                      <span className="rounded-md bg-[var(--ar-yellow-500)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ar-yellow-500)]">
                        Electivo
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mb-2 line-clamp-2 text-sm font-bold text-[var(--ar-navy-900)]">
                  {c.nombre}
                </h3>

                <p className="mb-4 line-clamp-3 flex-1 text-xs text-[var(--ar-navy-500)]">
                  {c.sumilla.slice(0, 200)}
                  {c.sumilla.length > 200 ? "…" : ""}
                </p>

                <div className="flex items-center justify-between gap-2 border-t border-[var(--ar-gray-100)] pt-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ar-navy-500)]">
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={2.25} />
                    {totalPreg} {totalPreg === 1 ? "pregunta" : "preguntas"}
                  </span>
                  {sinPreg ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-[var(--ar-orange-500)]">
                      <AlertTriangle
                        className="h-3.5 w-3.5"
                        strokeWidth={2.25}
                      />
                      Sin preguntas
                    </span>
                  ) : (
                    <Link
                      href={`/retos/${c.id}`}
                      className="ar-bg-green-gradient flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow transition-transform hover:scale-105"
                    >
                      <Play className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Jugar
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {siguienteEtapa && (
          <div className="mt-8 rounded-2xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-50)] p-5">
            <div className="flex items-center gap-3">
              <Lock
                className="h-5 w-5 text-[var(--ar-navy-500)]"
                strokeWidth={2.25}
              />
              <div>
                <h3 className="text-sm font-bold text-[var(--ar-navy-900)]">
                  Bloqueado: Etapa {siguienteEtapa.id} - {siguienteEtapa.nombre}
                </h3>
                <p className="text-xs text-[var(--ar-navy-500)]">
                  Acumula {siguienteEtapa.xpRequerido.toLocaleString("es-PE")} XP
                  para desbloquear los cursos de esta etapa.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
