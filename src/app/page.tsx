import Image from "next/image";
import {
  Lightbulb,
  Target,
  GraduationCap,
  Flame,
  BookOpen,
  Lock,
  User as UserIcon,
  Swords,
  Sparkles,
  Trophy,
  Medal,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEtapa, countPreguntasByEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
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
      <div className="p-8 text-red-400">
        No se encontro la etapa {usuario.etapaActual}.
      </div>
    );
  }

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;
  const preguntasDisp = await countPreguntasByEtapa(usuario.etapaActual);

  const imagen =
    usuario.genero === "MUJER" ? etapa.imagenMujer : etapa.imagenHombre;

  const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.trim();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== CAPA 0: Fondo inmersivo ===== */}
      <div className="fixed inset-0 z-0">
        <Image
          src={imagen}
          alt={etapa.titulo}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* ===== CAPA 1: Todo el UI ===== */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopBar
          nivel={etapa.id}
          xpActual={usuario.xpTotal}
          xpMeta={xpMeta}
          monedas={usuario.monedas}
          gemas={usuario.gemas}
          etapaTitulo={etapa.titulo}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 lg:px-6">
          <div className="grid min-h-[calc(100vh-130px)] grid-cols-1 lg:grid-cols-[1fr_340px]">
            {/* ===== Columna izquierda: Hero content ===== */}
            <div className="flex flex-col justify-end pb-8 pt-8 lg:pb-10 lg:pr-8 lg:pt-0">
              <div className="animate-fade-up max-w-xl">
                {/* Badge Etapa */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="glow-green inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--ar-green-600)] to-[var(--ar-green-500)] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Etapa {etapa.id}
                  </div>
                  {etapa.medalla && (
                    <div className="glass-chip inline-flex items-center gap-1.5 px-3 py-2">
                      {etapa.medalla === "oro" ? (
                        <Trophy className="h-3.5 w-3.5 text-[var(--ar-yellow-500)]" strokeWidth={2.5} />
                      ) : (
                        <Medal className="h-3.5 w-3.5 text-slate-300" strokeWidth={2.5} />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
                        {etapa.medalla}
                      </span>
                    </div>
                  )}
                </div>

                {/* Título principal */}
                <h1 className="text-4xl font-black leading-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] lg:text-6xl">
                  {etapa.titulo}
                </h1>
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-[var(--ar-blue-300)]/60">
                  {etapa.nombre}
                </p>

                {/* Progreso */}
                <div className="mt-4 inline-flex items-baseline gap-1 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-2xl font-black tabular-nums text-white">
                    {Math.round(etapa.porcentajeMin)}
                  </span>
                  <span className="text-sm font-bold text-[var(--ar-green-400)]">%</span>
                  <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    progreso
                  </span>
                </div>

                {/* Bienvenida */}
                <div className="mt-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ar-yellow-500)]/15">
                    <Lightbulb
                      className="h-5 w-5 text-[var(--ar-yellow-500)] drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]"
                      strokeWidth={2.25}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Bienvenido,{" "}
                      <span className="text-[var(--ar-green-400)]">
                        {usuario.nombre}
                      </span>
                    </h3>
                    <p className="mt-0.5 text-sm text-white/50">
                      {usuario.etapaActual === 0
                        ? "Responde 5 preguntas correctas para desbloquear la etapa de Practicante."
                        : `Sigue avanzando para llegar a la etapa ${usuario.etapaActual + 1}.`}
                    </p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/retos" className="game-btn game-btn-primary">
                    <Swords className="h-4 w-4" strokeWidth={2.5} />
                    Empezar reto
                  </a>
                  <a href="/cursos" className="game-btn game-btn-secondary">
                    <BookOpen className="h-4 w-4" strokeWidth={2.5} />
                    Ver cursos
                  </a>
                </div>

                {/* Stats chips */}
                <div className="animate-fade-up-delay mt-6 flex flex-wrap gap-3">
                  <div className="glass-chip flex items-center gap-2.5 px-4 py-2.5">
                    <Target className="h-4 w-4 text-[var(--ar-blue-300)]" strokeWidth={2.25} />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Retos</div>
                      <div className="text-lg font-black tabular-nums leading-tight text-white">0</div>
                    </div>
                  </div>
                  <div className="glass-chip flex items-center gap-2.5 px-4 py-2.5">
                    <GraduationCap className="h-4 w-4 text-[var(--ar-green-400)] drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]" strokeWidth={2.25} />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Precisión</div>
                      <div className="text-lg font-black tabular-nums leading-tight text-[var(--ar-green-400)]">{usuario.precision}%</div>
                    </div>
                  </div>
                  <div className="glass-chip flex items-center gap-2.5 px-4 py-2.5">
                    <Flame className="h-4 w-4 text-[var(--ar-orange-500)] drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" strokeWidth={2.25} />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Racha</div>
                      <div className="text-lg font-black tabular-nums leading-tight text-[var(--ar-orange-500)]">
                        {usuario.rachaActual}
                        {usuario.rachaActual === 0 && (
                          <span className="ml-1 text-[10px] font-medium text-white/30">Inicia</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="glass-chip flex items-center gap-2.5 px-4 py-2.5">
                    <BookOpen className="h-4 w-4 text-[var(--ar-blue-300)]" strokeWidth={2.25} />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Preguntas</div>
                      <div className="text-lg font-black tabular-nums leading-tight text-white">{preguntasDisp}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Columna derecha: Sidebar glass ===== */}
            <aside className="flex flex-col gap-4 pb-8 pt-4 lg:glass-scroll lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:py-6 lg:pl-4">
              {/* Ranking */}
              <RankingPanel />

              {/* Elementos bloqueados */}
              <div className="glass-panel-dense p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                  <Lock
                    className="h-4 w-4 text-white/30"
                    strokeWidth={2.5}
                  />
                  Elementos bloqueados
                </h3>
                <ul className="space-y-2.5">
                  {ELEMENTOS_BLOQUEADOS.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/35">
                      <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* User card */}
              <div className="glass-panel-dense p-4">
                <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ar-green-600)] to-[var(--ar-green-500)] text-white shadow-lg">
                    <UserIcon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">
                      {nombreCompleto}
                    </div>
                    <div className="text-xs text-white/40">
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
    </div>
  );
}
