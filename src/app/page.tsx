import { getEtapa, getCursosByEtapa, countPreguntasByEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { EtapaHero } from "@/components/hud/EtapaHero";
import { StatCard } from "@/components/hud/StatCard";
import { RankingPanel } from "@/components/hud/RankingPanel";
import { BottomNav } from "@/components/hud/BottomNav";

// Demo: sin autenticacion todavia. Mostramos etapa 0 con datos de prueba.
const DEMO_USUARIO = {
  nombre: "Estudiante AccountantRace",
  genero: "HOMBRE" as "HOMBRE" | "MUJER",
  etapaActual: 0,
  xpTotal: 0,
  monedas: 0,
  gemas: 0,
  rachaActual: 0,
  precision: 0,
  retosCompletados: 0,
};

export default async function HomePage() {
  const etapa = await getEtapa(DEMO_USUARIO.etapaActual);
  if (!etapa) {
    return (
      <div className="p-8 text-[var(--ar-navy-900)]">
        No se encontro la etapa {DEMO_USUARIO.etapaActual}. Corre el seed.
      </div>
    );
  }

  const siguienteEtapa = await getEtapa(DEMO_USUARIO.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;
  const cursos = await getCursosByEtapa(DEMO_USUARIO.etapaActual);
  const preguntasDisp = await countPreguntasByEtapa(DEMO_USUARIO.etapaActual);

  const imagen =
    DEMO_USUARIO.genero === "MUJER" ? etapa.imagenMujer : etapa.imagenHombre;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        nivel={etapa.id}
        xpActual={DEMO_USUARIO.xpTotal}
        xpMeta={xpMeta}
        monedas={DEMO_USUARIO.monedas}
        gemas={DEMO_USUARIO.gemas}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Columna principal */}
          <div className="flex flex-col gap-6">
            <EtapaHero
              etapaId={etapa.id}
              nombre={etapa.nombre}
              titulo={etapa.titulo}
              porcentaje={Math.round(etapa.porcentajeMin)}
              imagen={imagen}
              medalla={etapa.medalla}
            />

            {/* Bienvenida + CTA */}
            <div className="ar-bg-navy-gradient rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ar-yellow-500)]/20 text-2xl">
                  💡
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    Bienvenido a <span className="text-[var(--ar-green-500)]">AccountantRace</span>
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ar-blue-300)]">
                    Responde preguntas, gana XP y construye tu oficina contable paso
                    a paso. Tu primera meta: <strong className="text-white">5 preguntas correctas</strong> para
                    desbloquear la etapa de Practicante.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="ar-bg-green-gradient rounded-lg px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      Empezar reto
                    </button>
                    <button className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
                      Ver cursos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                titulo="Retos"
                valor={DEMO_USUARIO.retosCompletados}
                icon="🎯"
              />
              <StatCard
                titulo="Precisión"
                valor={`${DEMO_USUARIO.precision}%`}
                icon="🎓"
                variant="green"
              />
              <StatCard
                titulo="Racha"
                valor={DEMO_USUARIO.rachaActual}
                icon="🔥"
                variant="fire"
                hint={DEMO_USUARIO.rachaActual === 0 ? "Inicia tu racha" : undefined}
              />
              <StatCard
                titulo="Preguntas disponibles"
                valor={preguntasDisp}
                icon="📚"
                hint={
                  preguntasDisp === 0 ? "Genera con npm run seed:preguntas" : undefined
                }
              />
            </div>

            {/* Cursos de esta etapa */}
            <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                  Cursos en esta etapa
                </h3>
                <span className="rounded-full bg-[var(--ar-green-600)]/10 px-2.5 py-1 text-xs font-bold text-[var(--ar-green-600)]">
                  {cursos.length}{" "}
                  {cursos.length === 1 ? "curso" : "cursos"}
                </span>
              </div>
              {cursos.length === 0 ? (
                <p className="text-sm text-[var(--ar-navy-500)]">
                  No hay cursos asignados a esta etapa.
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {cursos.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-start gap-3 rounded-lg border border-[var(--ar-gray-100)] p-3 transition-colors hover:border-[var(--ar-blue-500)]/40 hover:bg-[var(--ar-blue-500)]/5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ar-navy-900)]/5 text-xs font-bold text-[var(--ar-navy-700)]">
                        C{c.ciclo}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--ar-navy-900)]">
                            {c.nombre}
                          </span>
                          {c.esElectivo && (
                            <span className="shrink-0 rounded bg-[var(--ar-yellow-500)]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--ar-yellow-500)]">
                              Electivo
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ar-navy-500)]">
                          {c.sumilla.slice(0, 140)}
                          {c.sumilla.length > 140 ? "…" : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Columna lateral */}
          <aside className="flex flex-col gap-4">
            <RankingPanel />

            <div className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                Elementos bloqueados
              </h3>
              <ul className="space-y-2 text-sm text-[var(--ar-navy-500)]">
                {[
                  "Biblioteca NIIF",
                  "Asistentes",
                  "Clientes",
                  "Sala de reuniones",
                  "Logo empresarial",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-4">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                Avatar (demo)
              </h3>
              <p className="mb-3 text-xs text-[var(--ar-navy-500)]">
                Cuando agregues login, el avatar cambia segun el genero del
                usuario.
              </p>
              <div className="flex items-center gap-3 rounded-lg bg-[var(--ar-gray-50)] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ar-navy-900)] text-white">
                  👤
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--ar-navy-900)]">
                    {DEMO_USUARIO.nombre}
                  </div>
                  <div className="text-xs text-[var(--ar-navy-500)]">
                    {etapa.nombre}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
