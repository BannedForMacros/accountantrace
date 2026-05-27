import Image from "next/image";
import {
  Trophy,
  Flame,
  Coins,
  Gem,
  TrendingUp,
  Target,
  GraduationCap,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  LogOut,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEtapa, getAllEtapas } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { BottomNav } from "@/components/hud/BottomNav";
import { logoutUsuario } from "@/app/login/actions";

export default async function PerfilPage() {
  const usuario = await requireUser();
  const etapa = await getEtapa(usuario.etapaActual);
  const todasEtapas = await getAllEtapas();
  if (!etapa) return null;

  const siguienteEtapa = todasEtapas.find((e) => e.id === usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;
  const xpRestante = Math.max(0, xpMeta - usuario.xpTotal);

  const imagen = usuario.genero === "MUJER" ? etapa.imagenMujer : etapa.imagenHombre;

  const partidas = await prisma.partida.findMany({
    where: { usuarioId: usuario.id, finalizadaEn: { not: null } },
    orderBy: { finalizadaEn: "desc" },
    take: 10,
    include: {
      curso: { select: { nombre: true, ciclo: true } },
    },
  });

  const totalPartidas = await prisma.partida.count({
    where: { usuarioId: usuario.id, finalizadaEn: { not: null } },
  });
  const totalResps = await prisma.respuesta.count({
    where: { usuarioId: usuario.id },
  });
  const totalCorrectas = await prisma.respuesta.count({
    where: { usuarioId: usuario.id, esCorrecta: true },
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <TopBar
        nivel={etapa.id}
        xpActual={usuario.xpTotal}
        xpMeta={xpMeta}
        monedas={usuario.monedas}
        gemas={usuario.gemas}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        <div className="relative mb-6 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <div className="relative aspect-[3/1] w-full md:aspect-[16/5]">
            <Image
              src={imagen}
              alt={etapa.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060E1A]/95 via-[#060E1A]/60 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center px-6 md:px-10">
            <div className="text-white">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-green-400)]">
                Etapa {etapa.id} · {etapa.nombre}
              </div>
              <h1 className="mt-1 text-2xl font-black md:text-3xl">
                {usuario.nombre} {usuario.apellidos}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--ar-blue-300)]/60">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" strokeWidth={2.25} />
                  {usuario.email}
                </span>
                <span>·</span>
                <span>
                  {usuario.genero === "MUJER" ? "Mujer" : "Hombre"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Desde {new Date(usuario.creadoEn).toLocaleDateString("es-PE")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatBig titulo="XP Total" valor={usuario.xpTotal.toLocaleString("es-PE")} Icon={TrendingUp} color="green" />
          <StatBig titulo="Monedas" valor={usuario.monedas.toLocaleString("es-PE")} Icon={Coins} color="yellow" />
          <StatBig titulo="Gemas" valor={usuario.gemas.toLocaleString("es-PE")} Icon={Gem} color="blue" />
          <StatBig titulo="Racha maxima" valor={usuario.rachaMaxima} Icon={Flame} color="orange" />
        </div>

        {siguienteEtapa && (
          <div className="game-card mb-6 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Progreso a Etapa {siguienteEtapa.id} · {siguienteEtapa.nombre}
              </h3>
              <span className="text-xs font-semibold text-[var(--ar-blue-300)]/60">
                {xpRestante.toLocaleString("es-PE")} XP restantes
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-[var(--ar-navy-900)] shadow-inner ring-1 ring-inset ring-white/5">
              <div
                className="xp-bar-shimmer absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--ar-green-600)] via-[var(--ar-green-400)] to-[var(--ar-green-500)] transition-all duration-700"
                style={{ width: `${Math.min(100, (usuario.xpTotal / xpMeta) * 100)}%` }}
              />
            </div>
            <div className="mt-1 text-xs tabular-nums text-[var(--ar-blue-300)]/50">
              {usuario.xpTotal.toLocaleString("es-PE")} / {xpMeta.toLocaleString("es-PE")} XP
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="game-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <Trophy className="h-4 w-4 text-[var(--ar-yellow-500)]" strokeWidth={2.5} />
                Historial reciente
              </h3>
              <span className="text-xs text-[var(--ar-blue-300)]/50">
                {partidas.length} de {totalPartidas}
              </span>
            </div>
            {partidas.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--ar-blue-300)]/50">
                Aun no has jugado ninguna partida. Ve a Retos para comenzar.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {partidas.map((p) => {
                  const precision =
                    p.totalPreguntas > 0
                      ? Math.round((p.totalCorrectas / p.totalPreguntas) * 100)
                      : 0;
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          precision >= 70
                            ? "bg-[var(--ar-green-600)]/15 text-[var(--ar-green-400)]"
                            : precision >= 40
                              ? "bg-[var(--ar-yellow-500)]/15 text-[var(--ar-yellow-500)]"
                              : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        <span className="text-sm font-bold tabular-nums">
                          {precision}%
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                          {p.curso?.nombre ?? "Curso eliminado"}
                        </div>
                        <div className="text-[11px] text-[var(--ar-blue-300)]/50">
                          {p.totalCorrectas}/{p.totalPreguntas} correctas · Etapa{" "}
                          {p.etapa} · racha max {p.rachaMaxPartida}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums text-[var(--ar-green-400)]">
                          +{p.puntajeFinal} XP
                        </div>
                        <div className="text-[10px] text-[var(--ar-blue-300)]/40">
                          {p.finalizadaEn
                            ? new Date(p.finalizadaEn).toLocaleDateString("es-PE")
                            : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="game-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <GraduationCap className="h-4 w-4 text-[var(--ar-green-400)]" strokeWidth={2.5} />
                Precision global
              </h3>
              <div className="text-3xl font-black tabular-nums text-white">
                {Math.round(usuario.precision)}%
              </div>
              <p className="text-xs text-[var(--ar-blue-300)]/50">
                {totalCorrectas} correctas de {totalResps} respondidas.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-[var(--ar-green-600)]/15 p-2">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-[var(--ar-green-400)]" strokeWidth={2.5} />
                  <div className="mt-1 text-lg font-bold tabular-nums text-[var(--ar-green-400)]">
                    {totalCorrectas}
                  </div>
                </div>
                <div className="rounded-lg bg-red-500/15 p-2">
                  <XCircle className="mx-auto h-4 w-4 text-red-400" strokeWidth={2.5} />
                  <div className="mt-1 text-lg font-bold tabular-nums text-red-400">
                    {totalResps - totalCorrectas}
                  </div>
                </div>
              </div>
            </div>

            <div className="game-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <Target className="h-4 w-4 text-[var(--ar-orange-500)]" strokeWidth={2.5} />
                Racha actual
              </h3>
              <div className="flex items-center gap-2 text-3xl font-black text-[var(--ar-orange-500)]">
                <Flame className="h-7 w-7 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" strokeWidth={2.5} />
                <span className="tabular-nums">{usuario.rachaActual}</span>
              </div>
              <p className="text-xs text-[var(--ar-blue-300)]/50">
                Respuestas correctas seguidas. Sigue acertando para no romperla.
              </p>
            </div>

            <form action={logoutUsuario}>
              <button
                type="submit"
                className="game-btn game-btn-secondary w-full justify-center !border-red-500/30 !bg-red-500/10 text-red-400 hover:!bg-red-500/20"
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                Cerrar sesion
              </button>
            </form>
          </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

function StatBig({
  titulo,
  valor,
  Icon,
  color,
}: {
  titulo: string;
  valor: string | number;
  Icon: LucideIcon;
  color: "green" | "yellow" | "blue" | "orange";
}) {
  const colorMap = {
    green: {
      box: "from-[var(--ar-green-600)]/15 to-[var(--ar-green-500)]/5 border-[var(--ar-green-600)]/20",
      icon: "text-[var(--ar-green-400)] drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]",
      value: "text-[var(--ar-green-400)]",
    },
    yellow: {
      box: "from-[var(--ar-yellow-500)]/15 to-[var(--ar-yellow-500)]/5 border-[var(--ar-yellow-500)]/20",
      icon: "text-[var(--ar-yellow-500)] drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]",
      value: "text-[var(--ar-yellow-500)]",
    },
    blue: {
      box: "from-[var(--ar-blue-500)]/15 to-[var(--ar-blue-500)]/5 border-[var(--ar-blue-500)]/20",
      icon: "text-[var(--ar-blue-300)] drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]",
      value: "text-[var(--ar-blue-300)]",
    },
    orange: {
      box: "from-[var(--ar-orange-500)]/15 to-[var(--ar-yellow-500)]/5 border-[var(--ar-orange-500)]/20",
      icon: "text-[var(--ar-orange-500)] drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]",
      value: "text-[var(--ar-orange-500)]",
    },
  }[color];

  return (
    <div className={`stat-card rounded-xl border bg-gradient-to-br p-4 ${colorMap.box}`}>
      <Icon className={`h-5 w-5 ${colorMap.icon}`} strokeWidth={2.5} />
      <div className={`mt-2 text-2xl font-black tabular-nums ${colorMap.value}`}>
        {valor}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
        {titulo}
      </div>
    </div>
  );
}
