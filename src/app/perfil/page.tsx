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

  // Partidas recientes
  const partidas = await prisma.partida.findMany({
    where: { usuarioId: usuario.id, finalizadaEn: { not: null } },
    orderBy: { finalizadaEn: "desc" },
    take: 10,
    include: {
      // @ts-expect-error - tipo derivado de relacion opcional
      curso: { select: { nombre: true, ciclo: true } },
    },
  });

  // Conteos globales
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
    <div className="flex min-h-screen flex-col">
      <TopBar
        nivel={etapa.id}
        xpActual={usuario.xpTotal}
        xpMeta={xpMeta}
        monedas={usuario.monedas}
        gemas={usuario.gemas}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        {/* Header de perfil con avatar de etapa */}
        <div className="ar-bg-navy-gradient relative mb-6 overflow-hidden rounded-3xl shadow-xl">
          <div className="relative aspect-[3/1] w-full md:aspect-[16/5]">
            <Image
              src={imagen}
              alt={etapa.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--ar-navy-900)]/95 via-[var(--ar-navy-900)]/60 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center px-6 md:px-10">
            <div className="text-white">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-blue-300)]">
                Etapa {etapa.id} · {etapa.nombre}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
                {usuario.nombre} {usuario.apellidos}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--ar-blue-300)]">
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

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatBig
            titulo="XP Total"
            valor={usuario.xpTotal.toLocaleString("es-PE")}
            Icon={TrendingUp}
            color="green"
          />
          <StatBig
            titulo="Monedas"
            valor={usuario.monedas.toLocaleString("es-PE")}
            Icon={Coins}
            color="yellow"
          />
          <StatBig
            titulo="Gemas"
            valor={usuario.gemas.toLocaleString("es-PE")}
            Icon={Gem}
            color="blue"
          />
          <StatBig
            titulo="Racha maxima"
            valor={usuario.rachaMaxima}
            Icon={Flame}
            color="orange"
          />
        </div>

        {/* Progreso a siguiente etapa */}
        {siguienteEtapa && (
          <div className="mb-6 rounded-2xl border border-[var(--ar-gray-200)] bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                Progreso a Etapa {siguienteEtapa.id} · {siguienteEtapa.nombre}
              </h3>
              <span className="text-xs font-semibold text-[var(--ar-navy-500)]">
                {xpRestante.toLocaleString("es-PE")} XP restantes
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--ar-gray-200)]">
              <div
                className="ar-bg-green-gradient h-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    (usuario.xpTotal / xpMeta) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="mt-1 text-xs tabular-nums text-[var(--ar-navy-500)]">
              {usuario.xpTotal.toLocaleString("es-PE")} /{" "}
              {xpMeta.toLocaleString("es-PE")} XP
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* Historial de partidas */}
          <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--ar-gray-200)] px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                <Trophy className="h-4 w-4 text-[var(--ar-yellow-500)]" strokeWidth={2.5} />
                Historial reciente
              </h3>
              <span className="text-xs text-[var(--ar-navy-500)]">
                {partidas.length} de {totalPartidas}
              </span>
            </div>
            {partidas.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--ar-navy-500)]">
                Aun no has jugado ninguna partida. Ve a Retos para comenzar.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--ar-gray-100)]">
                {partidas.map((p) => {
                  type PartidaConCurso = typeof p & {
                    curso?: { nombre: string; ciclo: number } | null;
                  };
                  const pc = p as PartidaConCurso;
                  const precision =
                    p.totalPreguntas > 0
                      ? Math.round((p.totalCorrectas / p.totalPreguntas) * 100)
                      : 0;
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          precision >= 70
                            ? "bg-[var(--ar-green-600)]/10 text-[var(--ar-green-600)]"
                            : precision >= 40
                              ? "bg-[var(--ar-yellow-500)]/10 text-[var(--ar-yellow-500)]"
                              : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        <span className="text-sm font-bold tabular-nums">
                          {precision}%
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[var(--ar-navy-900)]">
                          {pc.curso?.nombre ?? "Curso eliminado"}
                        </div>
                        <div className="text-[11px] text-[var(--ar-navy-500)]">
                          {p.totalCorrectas}/{p.totalPreguntas} correctas · Etapa{" "}
                          {p.etapa} · racha máx {p.rachaMaxPartida}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums text-[var(--ar-green-600)]">
                          +{p.puntajeFinal} XP
                        </div>
                        <div className="text-[10px] text-[var(--ar-navy-500)]">
                          {p.finalizadaEn
                            ? new Date(p.finalizadaEn).toLocaleDateString(
                                "es-PE"
                              )
                            : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Side: precision + logout */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                <GraduationCap
                  className="h-4 w-4 text-[var(--ar-green-600)]"
                  strokeWidth={2.5}
                />
                Precision global
              </h3>
              <div className="text-3xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
                {Math.round(usuario.precision)}%
              </div>
              <p className="text-xs text-[var(--ar-navy-500)]">
                {totalCorrectas} correctas de {totalResps} respondidas.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-[var(--ar-green-600)]/10 p-2">
                  <CheckCircle2
                    className="mx-auto h-4 w-4 text-[var(--ar-green-600)]"
                    strokeWidth={2.5}
                  />
                  <div className="mt-1 text-lg font-bold tabular-nums text-[var(--ar-green-600)]">
                    {totalCorrectas}
                  </div>
                </div>
                <div className="rounded-lg bg-red-500/10 p-2">
                  <XCircle className="mx-auto h-4 w-4 text-red-500" strokeWidth={2.5} />
                  <div className="mt-1 text-lg font-bold tabular-nums text-red-500">
                    {totalResps - totalCorrectas}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                <Target className="h-4 w-4 text-[var(--ar-navy-700)]" strokeWidth={2.5} />
                Racha actual
              </h3>
              <div className="flex items-center gap-2 text-3xl font-extrabold text-[var(--ar-orange-500)]">
                <Flame className="h-7 w-7" strokeWidth={2.5} />
                <span className="tabular-nums">{usuario.rachaActual}</span>
              </div>
              <p className="text-xs text-[var(--ar-navy-500)]">
                Respuestas correctas seguidas. Sigue acertando para no romperla.
              </p>
            </div>

            <form action={logoutUsuario}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-100"
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
      box: "from-[var(--ar-green-600)]/10 to-[var(--ar-green-500)]/5 border-[var(--ar-green-600)]/30",
      icon: "text-[var(--ar-green-600)]",
    },
    yellow: {
      box: "from-[var(--ar-yellow-500)]/10 to-[var(--ar-yellow-500)]/5 border-[var(--ar-yellow-500)]/30",
      icon: "text-[var(--ar-yellow-500)]",
    },
    blue: {
      box: "from-[var(--ar-blue-500)]/10 to-[var(--ar-blue-500)]/5 border-[var(--ar-blue-500)]/30",
      icon: "text-[var(--ar-blue-500)]",
    },
    orange: {
      box: "from-[var(--ar-orange-500)]/10 to-[var(--ar-yellow-500)]/5 border-[var(--ar-orange-500)]/30",
      icon: "text-[var(--ar-orange-500)]",
    },
  }[color];

  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 ${colorMap.box}`}
    >
      <Icon className={`h-5 w-5 ${colorMap.icon}`} strokeWidth={2.5} />
      <div className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
        {valor}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
        {titulo}
      </div>
    </div>
  );
}
