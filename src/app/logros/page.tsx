import {
  Award,
  Lock,
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  Trophy,
  Medal,
  Crown,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEtapa } from "@/lib/queries";
import { TopBar } from "@/components/hud/TopBar";
import { BottomNav } from "@/components/hud/BottomNav";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  Trophy,
  Medal,
  Crown,
  CheckCircle2,
  Award,
};

export default async function LogrosPage() {
  const usuario = await requireUser();
  const etapa = await getEtapa(usuario.etapaActual);
  if (!etapa) return null;

  const siguienteEtapa = await getEtapa(usuario.etapaActual + 1);
  const xpMeta = siguienteEtapa?.xpRequerido ?? etapa.xpRequerido + 100;

  const todosLogros = await prisma.logro.findMany({
    orderBy: { id: "asc" },
  });
  const desbloqueados = await prisma.usuarioLogro.findMany({
    where: { usuarioId: usuario.id },
    include: { logro: true },
  });
  const desbloqueadosMap = new Map(
    desbloqueados.map((u) => [u.logroId, u.desbloqueadoEn])
  );

  const totalDesbloqueados = desbloqueados.length;
  const totalLogros = todosLogros.length;
  const pct =
    totalLogros > 0 ? Math.round((totalDesbloqueados / totalLogros) * 100) : 0;

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
          <div className="glow-yellow flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ar-orange-500)] to-[var(--ar-yellow-500)] shadow-lg">
            <Award className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Logros
            </h1>
            <p className="text-sm text-[var(--ar-blue-300)]/60">
              {totalDesbloqueados} de {totalLogros} desbloqueados · {pct}%
            </p>
          </div>
        </div>

        <div className="game-card mb-6 p-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--ar-blue-300)]/60">
            <span>Progreso total</span>
            <span className="tabular-nums">
              {totalDesbloqueados}/{totalLogros}
            </span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-[var(--ar-navy-900)] shadow-inner ring-1 ring-inset ring-white/5">
            <div
              className="xp-bar-shimmer absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--ar-orange-500)] via-[var(--ar-yellow-500)] to-[var(--ar-orange-500)] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {todosLogros.length === 0 ? (
          <div className="game-card p-8 text-center">
            <Award className="mx-auto h-10 w-10 text-[var(--ar-blue-300)]/30" />
            <p className="mt-3 text-sm text-[var(--ar-blue-300)]/50">
              No hay logros configurados. Corre{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-[var(--ar-blue-300)]">
                npm run seed:logros
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todosLogros.map((l) => {
              const desbloqueadoEn = desbloqueadosMap.get(l.id);
              const desbloqueado = !!desbloqueadoEn;
              const Icon = ICON_MAP[l.icono] ?? Award;
              return (
                <article
                  key={l.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    desbloqueado
                      ? "border-[var(--ar-yellow-500)]/30 bg-gradient-to-br from-[var(--ar-yellow-500)]/10 to-[rgba(15,46,78,0.8)] shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : "border-white/5 bg-[rgba(15,46,78,0.4)] opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        desbloqueado
                          ? "bg-gradient-to-br from-[var(--ar-orange-500)] to-[var(--ar-yellow-500)] text-white shadow-lg shadow-[var(--ar-orange-500)]/20"
                          : "bg-white/5 text-[var(--ar-blue-300)]/30"
                      }`}
                    >
                      {desbloqueado ? (
                        <Icon className="h-6 w-6" strokeWidth={2.5} />
                      ) : (
                        <Lock className="h-5 w-5" strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm font-bold ${desbloqueado ? "text-white" : "text-[var(--ar-blue-300)]/50"}`}>
                        {l.nombre}
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--ar-blue-300)]/40">
                        {l.descripcion}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            desbloqueado
                              ? "bg-[var(--ar-green-600)]/15 text-[var(--ar-green-400)]"
                              : "bg-white/5 text-[var(--ar-blue-300)]/40"
                          }`}
                        >
                          +{l.xpRecompensa} XP
                        </span>
                        {desbloqueado && desbloqueadoEn && (
                          <span className="text-[10px] text-[var(--ar-blue-300)]/40">
                            {new Date(desbloqueadoEn).toLocaleDateString("es-PE")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
