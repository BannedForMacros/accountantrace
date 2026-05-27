import { Trophy, Medal, Flame, User as UserIcon, Crown } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { BottomNav } from "@/components/hud/BottomNav";

export default async function RankingPage() {
  const usuario = await requireUser();
  const etapa = await getEtapa(usuario.etapaActual);
  if (!etapa) return null;

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;

  const top = await prisma.usuario.findMany({
    where: { rol: "ESTUDIANTE" },
    orderBy: [{ xpTotal: "desc" }, { creadoEn: "asc" }],
    take: 100,
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      genero: true,
      xpTotal: true,
      etapaActual: true,
      rachaMaxima: true,
      precision: true,
    },
  });

  const posicionUsuario =
    top.findIndex((u) => u.id === usuario.id) >= 0
      ? top.findIndex((u) => u.id === usuario.id) + 1
      : (await prisma.usuario.count({
          where: {
            rol: "ESTUDIANTE",
            OR: [
              { xpTotal: { gt: usuario.xpTotal } },
              {
                xpTotal: usuario.xpTotal,
                creadoEn: { lt: usuario.creadoEn },
              },
            ],
          },
        })) + 1;

  const totalEstudiantes = await prisma.usuario.count({
    where: { rol: "ESTUDIANTE" },
  });

  const top3 = top.slice(0, 3);
  const resto = top.slice(3);

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
        <div className="mb-6 flex items-center gap-3">
          <div className="glow-yellow flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ar-yellow-500)] to-[var(--ar-orange-500)] shadow-lg">
            <Trophy className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Ranking global
            </h1>
            <p className="text-sm text-[var(--ar-blue-300)]/60">
              {totalEstudiantes}{" "}
              {totalEstudiantes === 1 ? "estudiante" : "estudiantes"} compitiendo
            </p>
          </div>
        </div>

        <div className="game-card mb-6 p-5">
          <div className="flex items-center gap-4">
            <div className="glow-yellow flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ar-yellow-500)]/15">
              <span className="text-2xl font-black text-[var(--ar-yellow-500)]">
                #{posicionUsuario}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-green-400)]">
                Tu posicion
              </div>
              <div className="text-lg font-bold text-white">
                {usuario.nombre} {usuario.apellidos}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tabular-nums text-white">
                {usuario.xpTotal.toLocaleString("es-PE")}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
                XP
              </div>
            </div>
          </div>
        </div>

        {top3.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {top3[1] && (
              <PodiumCard posicion={2} usuario={top3[1]} esTu={top3[1].id === usuario.id} altura="alto-2" />
            )}
            {top3[0] && (
              <PodiumCard posicion={1} usuario={top3[0]} esTu={top3[0].id === usuario.id} altura="alto-1" />
            )}
            {top3[2] && (
              <PodiumCard posicion={3} usuario={top3[2]} esTu={top3[2].id === usuario.id} altura="alto-3" />
            )}
          </div>
        )}

        {resto.length > 0 && (
          <div className="game-card overflow-hidden">
            <div className="border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Posiciones 4 - {top.length}
              </h3>
            </div>
            <ul className="divide-y divide-white/5">
              {resto.map((u, i) => {
                const pos = i + 4;
                const esTu = u.id === usuario.id;
                return (
                  <li
                    key={u.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      esTu ? "bg-[var(--ar-green-600)]/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold tabular-nums text-[var(--ar-blue-300)]/60">
                      #{pos}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-sm ${
                          esTu
                            ? "font-bold text-[var(--ar-green-400)]"
                            : "font-semibold text-white"
                        }`}
                      >
                        {u.nombre} {u.apellidos}
                        {esTu && (
                          <span className="ml-2 rounded bg-[var(--ar-green-600)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Tu
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--ar-blue-300)]/40">
                        <span>Etapa {u.etapaActual}</span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" strokeWidth={2.5} />
                          {u.rachaMaxima}
                        </span>
                        <span>{Math.round(u.precision)}% precision</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums text-white">
                        {u.xpTotal.toLocaleString("es-PE")}
                      </div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/40">
                        XP
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {top.length === 0 && (
          <div className="game-card p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-[var(--ar-blue-300)]/30" />
            <p className="mt-3 text-sm text-[var(--ar-blue-300)]/50">
              Aun no hay estudiantes en el ranking.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

interface PodiumUser {
  id: string;
  nombre: string;
  apellidos: string;
  xpTotal: number;
  etapaActual: number;
  rachaMaxima: number;
  precision: number;
}

function PodiumCard({
  posicion,
  usuario,
  esTu,
  altura,
}: {
  posicion: 1 | 2 | 3;
  usuario: PodiumUser;
  esTu: boolean;
  altura: "alto-1" | "alto-2" | "alto-3";
}) {
  const config = {
    1: {
      Icon: Crown,
      color: "text-[var(--ar-yellow-500)]",
      glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
      border: "border-[var(--ar-yellow-500)]/40",
      bg: "from-[var(--ar-yellow-500)]/15 to-transparent",
      label: "Oro",
    },
    2: {
      Icon: Medal,
      color: "text-slate-300",
      glow: "shadow-[0_0_15px_rgba(148,163,184,0.2)]",
      border: "border-slate-400/30",
      bg: "from-slate-300/10 to-transparent",
      label: "Plata",
    },
    3: {
      Icon: Medal,
      color: "text-[var(--ar-orange-500)]",
      glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]",
      border: "border-[var(--ar-orange-500)]/30",
      bg: "from-[var(--ar-orange-500)]/10 to-transparent",
      label: "Bronce",
    },
  }[posicion];

  const margenTop = {
    "alto-1": "mt-0",
    "alto-2": "mt-6",
    "alto-3": "mt-10",
  }[altura];

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-b p-4 text-center ${margenTop} ${config.border} ${config.bg} ${config.glow} ${
        esTu ? "ring-2 ring-[var(--ar-green-500)]/40" : ""
      }`}
      style={{ background: `linear-gradient(to bottom, rgba(15,46,78,0.8), rgba(10,37,64,0.95))` }}
    >
      <div className="flex justify-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ring-4 ${config.border} bg-[var(--ar-navy-900)]`}>
          <config.Icon className={`h-7 w-7 ${config.color}`} strokeWidth={2.5} />
        </div>
      </div>
      <div className={`mt-2 text-xs font-bold uppercase tracking-widest ${config.color}`}>
        #{posicion} · {config.label}
      </div>
      <div className="mt-2 line-clamp-2 text-sm font-bold text-white">
        {usuario.nombre} {usuario.apellidos}
        {esTu && (
          <span className="ml-1 rounded bg-[var(--ar-green-600)] px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-white">
            Tu
          </span>
        )}
      </div>
      <div className="mt-2 text-xl font-black tabular-nums text-white">
        {usuario.xpTotal.toLocaleString("es-PE")}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
        XP · Etapa {usuario.etapaActual}
      </div>
    </div>
  );
}
