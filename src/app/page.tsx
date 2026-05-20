import {
  Lightbulb,
  Target,
  GraduationCap,
  Flame,
  BookOpen,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEtapa, getCursosByEtapa, countPreguntasByEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { EtapaHero } from "@/components/hud/EtapaHero";
import { StatCard } from "@/components/hud/StatCard";
import { RankingPanel } from "@/components/hud/RankingPanel";
import { BottomNav } from "@/components/hud/BottomNav";

const ELEMENTOS_BLOQUEADOS = [
  "Biblioteca NIIF",
  "Asistentes",
  "Clientes",
  "Sala de reuniones",
  "Logo empresarial",
];

export default async function HomePage() {
  const usuario = await requireUser();
  const etapa = await getEtapa(usuario.etapaActual);
  if (!etapa) {
    return (
      <div className="p-8 text-[var(--ar-navy-900)]">
        No se encontro la etapa {usuario.etapaActual}.
      </div>
    );
  }

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;
  const cursos = await getCursosByEtapa(usuario.etapaActual);
  const preguntasDisp = await countPreguntasByEtapa(usuario.etapaActual);

  const imagen =
    usuario.genero === "MUJER" ? etapa.imagenMujer : etapa.imagenHombre;

  const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.trim();

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

            <div className="ar-bg-navy-gradient rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ar-yellow-500)]/20">
                  <Lightbulb
                    className="h-6 w-6 text-[var(--ar-yellow-500)]"
                    strokeWidth={2.25}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    Bienvenido,{" "}
                    <span className="text-[var(--ar-green-500)]">
                      {usuario.nombre}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ar-blue-300)]">
                    {usuario.etapaActual === 0
                      ? "Responde 5 preguntas correctas para desbloquear la etapa de Practicante."
                      : `Sigue avanzando para llegar a la etapa ${usuario.etapaActual + 1}.`}
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

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard titulo="Retos" valor={0} Icon={Target} />
              <StatCard
                titulo="Precisión"
                valor={`${usuario.precision}%`}
                Icon={GraduationCap}
                variant="green"
              />
              <StatCard
                titulo="Racha"
                valor={usuario.rachaActual}
                Icon={Flame}
                variant="fire"
                hint={
                  usuario.rachaActual === 0 ? "Inicia tu racha" : undefined
                }
              />
              <StatCard
                titulo="Preguntas disp."
                valor={preguntasDisp}
                Icon={BookOpen}
              />
            </div>

            <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                  <BookOpen
                    className="h-4 w-4 text-[var(--ar-navy-700)]"
                    strokeWidth={2.5}
                  />
                  Cursos en esta etapa
                </h3>
                <span className="rounded-full bg-[var(--ar-green-600)]/10 px-2.5 py-1 text-xs font-bold text-[var(--ar-green-600)]">
                  {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
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

          <aside className="flex flex-col gap-4">
            <RankingPanel />

            <div className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                <Lock
                  className="h-4 w-4 text-[var(--ar-navy-500)]"
                  strokeWidth={2.5}
                />
                Elementos bloqueados
              </h3>
              <ul className="space-y-2 text-sm text-[var(--ar-navy-500)]">
                {ELEMENTOS_BLOQUEADOS.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-4">
              <div className="flex items-center gap-3 rounded-lg bg-[var(--ar-gray-50)] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ar-navy-900)] text-white">
                  <UserIcon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--ar-navy-900)]">
                    {nombreCompleto}
                  </div>
                  <div className="text-xs text-[var(--ar-navy-500)]">
                    {etapa.nombre} · {usuario.genero === "MUJER" ? "Mujer" : "Hombre"}
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
