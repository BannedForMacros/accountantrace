"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Clock,
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Trophy,
  Coins,
  Gem,
  TrendingUp,
  RotateCcw,
  Home,
  Sparkles,
} from "lucide-react";
import {
  finalizarPartida,
  type RespuestaCliente,
  type ResultadoFinal,
} from "../actions";
import { TIEMPO_LIMITE_SEG, SPEED_BONUS_SEG } from "@/lib/scoring";

export interface PreguntaJuego {
  id: string;
  enunciado: string;
  alternativas: string[];
  correctaIdx: number;
  explicacion: string;
  dificultad: "FACIL" | "MEDIO" | "DIFICIL";
}

interface QuizClientProps {
  curso: {
    id: number;
    nombre: string;
    ciclo: number;
    etapaMinima: number;
  };
  preguntas: PreguntaJuego[];
}

type Estado = "INTRO" | "JUGANDO" | "FEEDBACK" | "ENVIANDO" | "RESULTADO";

const LETRAS = ["A", "B", "C", "D"];

const DIF_COLOR: Record<string, string> = {
  FACIL: "bg-[var(--ar-green-600)]/15 text-[var(--ar-green-400)]",
  MEDIO: "bg-[var(--ar-blue-500)]/15 text-[var(--ar-blue-300)]",
  DIFICIL: "bg-[var(--ar-orange-500)]/15 text-[var(--ar-orange-500)]",
};

export function QuizClient({ curso, preguntas }: QuizClientProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("INTRO");
  const [idx, setIdx] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestaCliente[]>([]);
  const [racha, setRacha] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_LIMITE_SEG);
  const [resultado, setResultado] = useState<ResultadoFinal | null>(null);
  const tiempoInicioRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pregunta = preguntas[idx];
  const totalPreg = preguntas.length;

  function limpiarTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function iniciarTimer() {
    limpiarTimer();
    setTiempoRestante(TIEMPO_LIMITE_SEG);
    tiempoInicioRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const transcurrido = (Date.now() - tiempoInicioRef.current) / 1000;
      const restante = Math.max(0, TIEMPO_LIMITE_SEG - transcurrido);
      setTiempoRestante(restante);
      if (restante <= 0) {
        limpiarTimer();
        responder(-1);
      }
    }, 100);
  }

  function comenzar() {
    setEstado("JUGANDO");
    iniciarTimer();
  }

  function responder(alternativa: number) {
    if (estado !== "JUGANDO") return;
    limpiarTimer();

    const tiempoSeg = Math.min(
      TIEMPO_LIMITE_SEG,
      (Date.now() - tiempoInicioRef.current) / 1000
    );
    const esCorrecta = alternativa === pregunta.correctaIdx && alternativa >= 0;

    setSeleccion(alternativa);
    setRacha((r) => (esCorrecta ? r + 1 : 0));
    setRespuestas((arr) => [
      ...arr,
      {
        preguntaId: pregunta.id,
        alternativaSeleccionada: alternativa,
        tiempoSeg: Math.round(tiempoSeg),
      },
    ]);
    setEstado("FEEDBACK");
  }

  async function siguiente() {
    if (idx + 1 >= totalPreg) {
      setEstado("ENVIANDO");
      try {
        const res = await finalizarPartida({
          cursoId: curso.id,
          etapa: curso.etapaMinima,
          respuestas,
        });
        setResultado(res);
        setEstado("RESULTADO");
      } catch (err) {
        console.error(err);
        alert("Error al guardar la partida. Intenta de nuevo.");
        setEstado("FEEDBACK");
      }
      return;
    }
    setIdx((i) => i + 1);
    setSeleccion(null);
    setEstado("JUGANDO");
    iniciarTimer();
  }

  useEffect(() => () => limpiarTimer(), []);

  // ============== INTRO ==============
  if (estado === "INTRO") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060E1A] p-6">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <div className="bg-gradient-to-r from-[var(--ar-navy-900)] to-[var(--ar-navy-700)] px-6 py-5 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-green-400)]">
              Ciclo {curso.ciclo} · Etapa {curso.etapaMinima}
            </div>
            <h1 className="mt-1 text-xl font-black">{curso.nombre}</h1>
          </div>
          <div className="bg-[rgba(10,37,64,0.95)] px-6 py-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-2xl font-black tabular-nums text-white">
                  {totalPreg}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
                  Preguntas
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-2xl font-black tabular-nums text-white">
                  {TIEMPO_LIMITE_SEG}s
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
                  Por pregunta
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-black tabular-nums text-[var(--ar-blue-300)]">
                  <Zap className="h-5 w-5" strokeWidth={2.5} />
                  {SPEED_BONUS_SEG}s
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
                  Speed bonus
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/5 bg-white/5 p-3 text-xs text-[var(--ar-blue-300)]/60">
              <strong className="text-white">Reglas:</strong> respuesta correcta = XP. Si respondes en
              menos de {SPEED_BONUS_SEG}s, recibes bonus extra. Encadena correctas
              para subir tu racha.
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href="/retos"
                className="game-btn game-btn-secondary"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </Link>
              <button
                onClick={comenzar}
                className="game-btn game-btn-primary flex-1 justify-center"
              >
                <Play className="h-4 w-4" strokeWidth={2.5} /> Comenzar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============== RESULTADO ==============
  if (estado === "RESULTADO" && resultado) {
    return <ResultadoView resultado={resultado} curso={curso} router={router} />;
  }

  // ============== JUGANDO / FEEDBACK ==============
  const pctTiempo = (tiempoRestante / TIEMPO_LIMITE_SEG) * 100;
  const speedActivo = tiempoRestante > TIEMPO_LIMITE_SEG - SPEED_BONUS_SEG;

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <header className="border-b border-[rgba(59,130,246,0.15)] bg-[rgba(10,37,64,0.92)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/retos"
            className="rounded-full p-2 text-[var(--ar-blue-300)]/50 transition-colors hover:bg-white/10 hover:text-white"
            title="Abandonar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="truncate text-xs font-semibold text-[var(--ar-blue-300)]/50">
              {curso.nombre}
            </div>
            <div className="text-base font-bold text-white">
              Pregunta {idx + 1} <span className="text-[var(--ar-blue-300)]/50 text-sm">/ {totalPreg}</span>
            </div>
          </div>
          {racha >= 2 && (
            <div className="flex items-center gap-1 rounded-full bg-[var(--ar-orange-500)]/15 px-3 py-1 text-[var(--ar-orange-500)]">
              <Flame className="h-4 w-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" strokeWidth={2.5} />
              <span className="text-sm font-bold tabular-nums">x{racha}</span>
            </div>
          )}
        </div>
        <div className="h-1 w-full bg-[var(--ar-navy-900)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--ar-green-600)] to-[var(--ar-green-400)] transition-all"
            style={{ width: `${((idx + (estado === "FEEDBACK" ? 1 : 0)) / totalPreg) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="h-4 w-4 text-[var(--ar-blue-300)]" strokeWidth={2.25} />
              {tiempoRestante.toFixed(1)}s
            </div>
            {speedActivo && estado === "JUGANDO" && (
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ar-blue-300)]">
                <Zap className="h-3.5 w-3.5 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" strokeWidth={2.5} />
                Speed bonus activo
              </div>
            )}
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${DIF_COLOR[pregunta.dificultad]}`}>
              {pregunta.dificultad}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--ar-navy-900)] ring-1 ring-inset ring-white/5">
            <div
              className={`h-full transition-all ${
                speedActivo
                  ? "bg-gradient-to-r from-[var(--ar-orange-500)] to-[var(--ar-yellow-500)]"
                  : tiempoRestante < 5
                    ? "bg-red-500"
                    : "bg-[var(--ar-blue-500)]"
              }`}
              style={{ width: `${pctTiempo}%` }}
            />
          </div>
        </div>

        <div className="game-card p-6">
          <p className="mb-5 text-base font-medium leading-relaxed text-white">
            {pregunta.enunciado}
          </p>

          <div className="flex flex-col gap-2">
            {pregunta.alternativas.map((alt, i) => {
              const esCorrecta = i === pregunta.correctaIdx;
              const esSeleccionada = i === seleccion;
              const enFeedback = estado === "FEEDBACK";

              let cls = "border-white/10 bg-white/5 hover:border-[var(--ar-blue-500)]/40 hover:bg-[var(--ar-blue-500)]/10 text-white";
              if (enFeedback) {
                if (esCorrecta) {
                  cls = "border-[var(--ar-green-500)] bg-[var(--ar-green-600)]/15 text-[var(--ar-green-400)] shadow-[0_0_15px_rgba(22,163,74,0.15)]";
                } else if (esSeleccionada) {
                  cls = "border-red-500 bg-red-500/10 text-red-400";
                } else {
                  cls = "border-white/5 bg-white/[0.02] opacity-40 text-white/50";
                }
              }

              return (
                <button
                  key={i}
                  disabled={estado !== "JUGANDO"}
                  onClick={() => responder(i)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left text-sm font-medium transition-all disabled:cursor-default ${cls}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      enFeedback && esCorrecta
                        ? "border-[var(--ar-green-500)] bg-[var(--ar-green-500)] text-white"
                        : enFeedback && esSeleccionada
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-white/20 text-white/60"
                    }`}
                  >
                    {LETRAS[i]}
                  </span>
                  <span className="flex-1">{alt}</span>
                  {enFeedback && esCorrecta && (
                    <CheckCircle2 className="h-5 w-5 text-[var(--ar-green-400)]" />
                  )}
                  {enFeedback && esSeleccionada && !esCorrecta && (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </button>
              );
            })}
          </div>

          {estado === "FEEDBACK" && pregunta.explicacion && (
            <div className="mt-4 rounded-lg border border-[var(--ar-blue-500)]/20 bg-[var(--ar-blue-500)]/10 p-3 text-sm text-[var(--ar-blue-300)]">
              <strong className="text-white">Explicacion: </strong>
              {pregunta.explicacion}
            </div>
          )}
        </div>

        {estado === "FEEDBACK" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={siguiente}
              className="game-btn game-btn-primary"
            >
              {idx + 1 >= totalPreg ? "Ver resultado" : "Siguiente"}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {estado === "ENVIANDO" && (
          <div className="mt-4 text-center text-sm text-[var(--ar-blue-300)]/50">
            Guardando partida...
          </div>
        )}
      </main>
    </div>
  );
}

function ResultadoView({
  resultado,
  curso,
  router,
}: {
  resultado: ResultadoFinal;
  curso: { id: number; nombre: string };
  router: ReturnType<typeof useRouter>;
}) {
  const pctAciertos = Math.round(resultado.precisionPct);

  return (
    <div className="flex min-h-screen items-start justify-center overflow-y-auto bg-[#060E1A] p-6">
      <div className="my-8 w-full max-w-xl">
        {resultado.subioEtapa && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--ar-green-600)] to-[var(--ar-green-500)] p-5 text-white shadow-xl shadow-[var(--ar-green-600)]/20">
            <Sparkles className="h-8 w-8 shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-90">
                Nivel desbloqueado!
              </div>
              <div className="text-lg font-black">
                Avanzaste a la Etapa {resultado.etapaDespues}
              </div>
            </div>
          </div>
        )}

        {resultado.logrosNuevos.length > 0 && (
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-[var(--ar-orange-500)] to-[var(--ar-yellow-500)] p-5 text-white shadow-xl shadow-[var(--ar-orange-500)]/20">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              Logros desbloqueados
            </div>
            <ul className="space-y-1">
              {resultado.logrosNuevos.map((l) => (
                <li
                  key={l.codigo}
                  className="flex items-center justify-between rounded-lg bg-white/15 px-3 py-2"
                >
                  <span className="text-sm font-semibold">{l.nombre}</span>
                  <span className="text-xs font-bold">+{l.xpRecompensa} XP</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <div className="bg-gradient-to-r from-[var(--ar-navy-900)] to-[var(--ar-navy-700)] px-6 py-5 text-center text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-green-400)]">
              Resultado del reto
            </div>
            <h1 className="mt-1 line-clamp-1 text-lg font-bold">{curso.nombre}</h1>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-[var(--ar-yellow-500)] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              <span className="text-4xl font-black tabular-nums">
                {resultado.totalCorrectas}
                <span className="text-2xl text-[var(--ar-blue-300)]/60">
                  /{resultado.totalPreguntas}
                </span>
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--ar-blue-300)]/60">
              {pctAciertos}% de precision
            </div>
          </div>

          <div className="bg-[rgba(10,37,64,0.95)] px-6 py-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="XP ganado" value={`+${resultado.puntajeFinal}`} Icon={TrendingUp} color="green" />
              <Stat label="Monedas" value={`+${resultado.monedasGanadas}`} Icon={Coins} color="yellow" />
              <Stat label="Gemas" value={`+${resultado.gemasGanadas}`} Icon={Gem} color="blue" />
              <Stat label="Racha max." value={resultado.rachaMaxPartida} Icon={Flame} color="orange" />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ar-blue-300)]/50">
                XP total acumulado
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black tabular-nums text-white">
                  {resultado.xpDespues.toLocaleString("es-PE")}
                </span>
                <span className="text-sm text-[var(--ar-blue-300)]/40">
                  (antes: {resultado.xpAntes.toLocaleString("es-PE")})
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => router.push("/retos")}
                className="game-btn game-btn-secondary"
              >
                <Home className="h-4 w-4" /> Mas retos
              </button>
              <button
                onClick={() => router.refresh()}
                className="game-btn game-btn-primary flex-1 justify-center"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                Jugar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

function Stat({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  color: "green" | "yellow" | "blue" | "orange";
}) {
  const colorMap = {
    green: { icon: "text-[var(--ar-green-400)] drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]", value: "text-[var(--ar-green-400)]" },
    yellow: { icon: "text-[var(--ar-yellow-500)] drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]", value: "text-[var(--ar-yellow-500)]" },
    blue: { icon: "text-[var(--ar-blue-300)] drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]", value: "text-[var(--ar-blue-300)]" },
    orange: { icon: "text-[var(--ar-orange-500)] drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]", value: "text-[var(--ar-orange-500)]" },
  };
  const c = colorMap[color];
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <Icon className={`h-4 w-4 ${c.icon}`} strokeWidth={2.5} />
      <div className={`mt-1 text-lg font-black tabular-nums ${c.value}`}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-blue-300)]/40">
        {label}
      </div>
    </div>
  );
}
