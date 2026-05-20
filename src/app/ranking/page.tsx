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

  // Top 100
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

  // Posicion del usuario actual (si no esta en top 100)
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
    <div className="flex min-h-screen flex-col">
      <TopBar
        nivel={etapa.id}
        xpActual={usuario.xpTotal}
        xpMeta={xpMeta}
        monedas={usuario.monedas}
        gemas={usuario.gemas}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="ar-bg-fire-gradient flex h-10 w-10 items-center justify-center rounded-lg shadow-lg">
            <Trophy className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--ar-navy-900)]">
              Ranking global
            </h1>
            <p className="text-sm text-[var(--ar-navy-500)]">
              {totalEstudiantes}{" "}
              {totalEstudiantes === 1 ? "estudiante" : "estudiantes"} compitiendo
            </p>
          </div>
        </div>

        {/* Posicion del usuario actual */}
        <div className="ar-bg-navy-gradient mb-6 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ar-yellow-500)]/20">
              <span className="text-2xl font-extrabold text-[var(--ar-yellow-500)]">
                #{posicionUsuario}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-blue-300)]">
                Tu posicion
              </div>
              <div className="text-lg font-bold">
                {usuario.nombre} {usuario.apellidos}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold tabular-nums">
                {usuario.xpTotal.toLocaleString("es-PE")}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]">
                XP
              </div>
            </div>
          </div>
        </div>

        {/* Podium top 3 */}
        {top3.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {/* 2do (izquierda) */}
            {top3[1] && (
              <PodiumCard
                posicion={2}
                usuario={top3[1]}
                esTu={top3[1].id === usuario.id}
                altura="alto-2"
              />
            )}
            {/* 1ro (centro) */}
            {top3[0] && (
              <PodiumCard
                posicion={1}
                usuario={top3[0]}
                esTu={top3[0].id === usuario.id}
                altura="alto-1"
              />
            )}
            {/* 3ro (derecha) */}
            {top3[2] && (
              <PodiumCard
                posicion={3}
                usuario={top3[2]}
                esTu={top3[2].id === usuario.id}
                altura="alto-3"
              />
            )}
          </div>
        )}

        {/* Tabla del resto */}
        {resto.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[var(--ar-gray-200)] bg-white">
            <div className="border-b border-[var(--ar-gray-200)] bg-[var(--ar-gray-50)] px-4 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
                Posiciones 4 - {top.length}
              </h3>
            </div>
            <ul className="divide-y divide-[var(--ar-gray-100)]">
              {resto.map((u, i) => {
                const pos = i + 4;
                const esTu = u.id === usuario.id;
                return (
                  <li
                    key={u.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      esTu ? "bg-[var(--ar-green-600)]/10" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ar-gray-100)] text-xs font-bold tabular-nums text-[var(--ar-navy-700)]">
                      #{pos}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-sm ${
                          esTu
                            ? "font-bold text-[var(--ar-green-600)]"
                            : "font-semibold text-[var(--ar-navy-900)]"
                        }`}
                      >
                        {u.nombre} {u.apellidos}
                        {esTu && (
                          <span className="ml-2 rounded bg-[var(--ar-green-600)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Tu
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--ar-navy-500)]">
                        <span>Etapa {u.etapaActual}</span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" strokeWidth={2.5} />
                          {u.rachaMaxima}
                        </span>
                        <span>{Math.round(u.precision)}% precisión</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums text-[var(--ar-navy-900)]">
                        {u.xpTotal.toLocaleString("es-PE")}
                      </div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
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
          <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-[var(--ar-navy-500)]" />
            <p className="mt-3 text-sm text-[var(--ar-navy-500)]">
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
      ring: "ring-[var(--ar-yellow-500)]",
      bg: "bg-gradient-to-b from-[var(--ar-yellow-500)]/20 to-transparent",
      label: "Oro",
    },
    2: {
      Icon: Medal,
      color: "text-slate-400",
      ring: "ring-slate-400",
      bg: "bg-gradient-to-b from-slate-300/30 to-transparent",
      label: "Plata",
    },
    3: {
      Icon: Medal,
      color: "text-[var(--ar-orange-500)]",
      ring: "ring-[var(--ar-orange-500)]",
      bg: "bg-gradient-to-b from-[var(--ar-orange-500)]/20 to-transparent",
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
      className={`relative rounded-2xl border-2 bg-white p-4 text-center shadow-md ${margenTop} ${
        esTu ? "border-[var(--ar-green-600)]" : "border-[var(--ar-gray-200)]"
      } ${config.bg}`}
    >
      <div className="flex justify-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-white ring-4 ${config.ring}`}
        >
          <config.Icon className={`h-7 w-7 ${config.color}`} strokeWidth={2.5} />
        </div>
      </div>
      <div className={`mt-2 text-xs font-bold uppercase tracking-widest ${config.color}`}>
        #{posicion} · {config.label}
      </div>
      <div className="mt-2 line-clamp-2 text-sm font-bold text-[var(--ar-navy-900)]">
        {usuario.nombre} {usuario.apellidos}
        {esTu && (
          <span className="ml-1 rounded bg-[var(--ar-green-600)] px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-white">
            Tu
          </span>
        )}
      </div>
      <div className="mt-2 text-xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
        {usuario.xpTotal.toLocaleString("es-PE")}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
        XP · Etapa {usuario.etapaActual}
      </div>
    </div>
  );
}
