import Link from "next/link";
import { BookOpen, Lock, Play, Filter, ChartBar } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { BottomNav } from "@/components/hud/BottomNav";

interface Props {
  searchParams: Promise<{
    ciclo?: string;
    etapa?: string;
    electivo?: string;
  }>;
}

const CICLOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ETAPAS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default async function CursosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const usuario = await requireUser();
  const etapaActual = await getEtapa(usuario.etapaActual);
  if (!etapaActual) return null;

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapaActual.xpRequerido + 100;

  const cicloFiltro = sp.ciclo ? Number(sp.ciclo) : undefined;
  const etapaFiltro = sp.etapa !== undefined ? Number(sp.etapa) : undefined;
  const electivoFiltro = sp.electivo === "1" ? true : undefined;

  const cursos = await prisma.curso.findMany({
    where: {
      ...(cicloFiltro !== undefined ? { ciclo: cicloFiltro } : {}),
      ...(etapaFiltro !== undefined ? { etapaMinima: etapaFiltro } : {}),
      ...(electivoFiltro ? { esElectivo: true } : {}),
    },
    orderBy: [{ ciclo: "asc" }, { numero: "asc" }],
  });

  const conteoPreg = await prisma.pregunta.groupBy({
    by: ["cursoId"],
    _count: { _all: true },
  });
  const conteoMap = new Map(conteoPreg.map((p) => [p.cursoId, p._count._all]));

  const progresos = await prisma.progreso.findMany({
    where: { usuarioId: usuario.id },
  });
  const progresoMap = new Map(progresos.map((p) => [p.cursoId, p]));

  function filtroLink(
    key: "ciclo" | "etapa" | "electivo",
    value: string | null
  ): string {
    const p = new URLSearchParams();
    if (cicloFiltro !== undefined && key !== "ciclo")
      p.set("ciclo", String(cicloFiltro));
    if (etapaFiltro !== undefined && key !== "etapa")
      p.set("etapa", String(etapaFiltro));
    if (electivoFiltro && key !== "electivo") p.set("electivo", "1");
    if (value !== null) p.set(key, value);
    const qs = p.toString();
    return qs ? `/cursos?${qs}` : "/cursos";
  }

  const hayFiltros =
    cicloFiltro !== undefined ||
    etapaFiltro !== undefined ||
    electivoFiltro !== undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <TopBar
        nivel={etapaActual.id}
        xpActual={usuario.xpTotal}
        xpMeta={xpMeta}
        monedas={usuario.monedas}
        gemas={usuario.gemas}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="glow-blue flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ar-blue-500)] to-[var(--ar-navy-700)] shadow-lg">
            <BookOpen className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Plan de estudios
            </h1>
            <p className="text-sm text-[var(--ar-blue-300)]/60">
              53 cursos de contabilidad en 10 ciclos
            </p>
          </div>
        </div>

        <div className="game-card mb-5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
              <Filter className="h-4 w-4 text-[var(--ar-blue-300)]" strokeWidth={2.5} />
              Filtros
            </div>
            {hayFiltros && (
              <Link
                href="/cursos"
                className="text-xs font-semibold text-[var(--ar-green-400)] hover:underline"
              >
                Limpiar
              </Link>
            )}
          </div>

          <div className="space-y-3">
            <FilterGroup
              titulo="Ciclo"
              items={CICLOS.map((c) => ({ value: String(c), label: `Ciclo ${c}` }))}
              currentValue={cicloFiltro !== undefined ? String(cicloFiltro) : null}
              hrefBuilder={(v) => filtroLink("ciclo", v)}
            />
            <FilterGroup
              titulo="Etapa del juego"
              items={ETAPAS.map((e) => ({ value: String(e), label: `Etapa ${e}` }))}
              currentValue={etapaFiltro !== undefined ? String(etapaFiltro) : null}
              hrefBuilder={(v) => filtroLink("etapa", v)}
            />
            <FilterGroup
              titulo="Tipo"
              items={[{ value: "1", label: "Solo electivos" }]}
              currentValue={electivoFiltro ? "1" : null}
              hrefBuilder={(v) => filtroLink("electivo", v)}
            />
          </div>
        </div>

        <p className="mb-3 text-sm text-[var(--ar-blue-300)]/50">
          {cursos.length} {cursos.length === 1 ? "curso" : "cursos"} encontrados
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cursos.map((c) => {
            const totalPreg = conteoMap.get(c.id) ?? 0;
            const progreso = progresoMap.get(c.id);
            const bloqueado = c.etapaMinima > usuario.etapaActual;
            const sinPreg = totalPreg === 0;
            const respondidas = progreso?.preguntasResp ?? 0;
            const correctas = progreso?.preguntasCorrectas ?? 0;
            const precisionCurso =
              respondidas > 0 ? Math.round((correctas / respondidas) * 100) : null;

            return (
              <article
                key={c.id}
                className={`game-card flex flex-col p-5 transition-all ${
                  bloqueado
                    ? "opacity-40"
                    : "hover:ring-1 hover:ring-[var(--ar-green-600)]/30 hover:shadow-[0_0_25px_rgba(22,163,74,0.1)]"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-[var(--ar-navy-700)] px-2 py-0.5 text-[10px] font-bold text-[var(--ar-blue-300)]">
                    Ciclo {c.ciclo}
                  </span>
                  <span className="rounded-md bg-[var(--ar-green-600)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--ar-green-400)]">
                    Etapa {c.etapaMinima}
                  </span>
                  {c.esElectivo && (
                    <span className="rounded-md bg-[var(--ar-yellow-500)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ar-yellow-500)]">
                      Electivo
                    </span>
                  )}
                  {bloqueado && (
                    <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ar-blue-300)]/40">
                      <Lock className="h-3 w-3" strokeWidth={2.5} /> Bloqueado
                    </span>
                  )}
                </div>

                <h3 className="mb-2 line-clamp-2 text-sm font-bold text-white">
                  {c.nombre}
                </h3>

                <div className="mb-3 flex-1" />

                {progreso && respondidas > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                    <div>
                      <div className="text-base font-bold tabular-nums text-white">
                        {respondidas}
                      </div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/40">
                        Respondidas
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold tabular-nums text-[var(--ar-green-400)]">
                        {precisionCurso}%
                      </div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/40">
                        Precision
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold tabular-nums text-[var(--ar-yellow-500)]">
                        {progreso.xpAcumulado}
                      </div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/40">
                        XP
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ar-blue-300)]/40">
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={2.25} />
                    {totalPreg} preg.
                  </span>
                  {bloqueado ? (
                    <span className="text-xs font-semibold text-[var(--ar-blue-300)]/40">
                      Requiere etapa {c.etapaMinima}
                    </span>
                  ) : sinPreg ? (
                    <span className="text-xs font-semibold text-[var(--ar-orange-500)]/70">
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

        {cursos.length === 0 && (
          <div className="game-card p-8 text-center">
            <ChartBar className="mx-auto h-10 w-10 text-[var(--ar-blue-300)]/30" />
            <p className="mt-3 text-sm text-[var(--ar-blue-300)]/50">
              No hay cursos con esos filtros.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function FilterGroup({
  titulo,
  items,
  currentValue,
  hrefBuilder,
}: {
  titulo: string;
  items: { value: string; label: string }[];
  currentValue: string | null;
  hrefBuilder: (value: string | null) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
        {titulo}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => {
          const activo = currentValue === it.value;
          return (
            <Link
              key={it.value}
              href={activo ? hrefBuilder(null) : hrefBuilder(it.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                activo
                  ? "border-[var(--ar-green-500)] bg-[var(--ar-green-600)] text-white shadow-[0_0_10px_rgba(22,163,74,0.3)]"
                  : "border-white/10 bg-white/5 text-[var(--ar-blue-300)]/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
