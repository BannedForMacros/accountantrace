import Link from "next/link";
import { Play, BookOpen, Lock, Target, AlertTriangle, Zap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEtapa } from "@/lib/queries";
import { xpMaximoReto } from "@/lib/scoring";
import { TopBar } from "@/components/hud/TopBar";
import { BottomNav } from "@/components/hud/BottomNav";

export default async function RetosPage() {
  const usuario = await requireUser();
  const etapa = await getEtapa(usuario.etapaActual);
  if (!etapa) return null;

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;

  const cursos = await prisma.curso.findMany({
    where: { etapaMinima: { lte: usuario.etapaActual } },
    orderBy: [{ etapaMinima: "asc" }, { numero: "asc" }],
  });

  const preguntasPorCurso = await prisma.pregunta.groupBy({
    by: ["cursoId"],
    _count: { _all: true },
  });
  const conteoMap = new Map(
    preguntasPorCurso.map((p) => [p.cursoId, p._count._all])
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <TopBar
        nivel={etapa.id}
        xpActual={usuario.xpTotal}
        xpMeta={xpMeta}
        monedas={usuario.monedas}
        gemas={usuario.gemas}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="glow-green flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ar-green-600)] to-[var(--ar-green-500)] shadow-lg">
            <Target className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Retos disponibles
            </h1>
            <p className="text-sm text-[var(--ar-blue-300)]/60">
              {cursos.length} cursos accesibles segun tu etapa actual
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => {
            const totalPreg = conteoMap.get(c.id) ?? 0;
            const sinPreg = totalPreg === 0;

            return (
              <article
                key={c.id}
                className={`game-card flex flex-col p-5 transition-all ${
                  sinPreg
                    ? "opacity-50"
                    : "hover:ring-1 hover:ring-[var(--ar-green-600)]/30 hover:shadow-[0_0_25px_rgba(22,163,74,0.1)]"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ar-navy-700)] px-2 py-0.5 text-[10px] font-bold text-[var(--ar-blue-300)]">
                      C{c.ciclo}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ar-green-600)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--ar-green-400)]">
                      Etapa {c.etapaMinima}
                    </span>
                    {c.esElectivo && (
                      <span className="rounded-md bg-[var(--ar-yellow-500)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ar-yellow-500)]">
                        Electivo
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mb-2 line-clamp-2 text-sm font-bold text-white">
                  {c.nombre}
                </h3>

                <div className="flex-1" />

                {!sinPreg && (
                  <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-md bg-[var(--ar-green-600)]/10 px-2 py-1 text-[11px] font-bold text-[var(--ar-green-400)]">
                    <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Hasta {xpMaximoReto(totalPreg)} XP
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ar-blue-300)]/50">
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={2.25} />
                    {totalPreg} {totalPreg === 1 ? "pregunta" : "preguntas"}
                  </span>
                  {sinPreg ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-[var(--ar-orange-500)]/70">
                      <AlertTriangle
                        className="h-3.5 w-3.5"
                        strokeWidth={2.25}
                      />
                      Sin preguntas
                    </span>
                  ) : (
                    <Link
                      href={`/retos/${c.id}`}
                      className="game-btn game-btn-primary !px-4 !py-1.5 !text-[11px]"
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
          <div className="mt-8 game-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <Lock
                  className="h-5 w-5 text-[var(--ar-blue-300)]/40"
                  strokeWidth={2.25}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Bloqueado: Etapa {siguienteEtapa.id} - {siguienteEtapa.nombre}
                </h3>
                <p className="text-xs text-[var(--ar-blue-300)]/50">
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
