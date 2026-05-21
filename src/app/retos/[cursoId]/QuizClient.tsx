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
  FACIL: "bg-[var(--ar-green-600)]/10 text-[var(--ar-green-600)]",
  MEDIO: "bg-[var(--ar-blue-500)]/10 text-[var(--ar-blue-500)]",
  DIFICIL: "bg-[var(--ar-orange-500)]/10 text-[var(--ar-orange-500)]",
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
        responder(-1); // se acabo el tiempo
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
      <div className="ar-bg-navy-gradient flex min-h-screen items-center justify-center p-6">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="ar-bg-navy-gradient px-6 py-5 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-blue-300)]">
              Ciclo {curso.ciclo} · Etapa {curso.etapaMinima}
            </div>
            <h1 className="mt-1 text-xl font-extrabold">{curso.nombre}</h1>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-[var(--ar-gray-200)] p-3">
                <div className="text-2xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
                  {totalPreg}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
                  Preguntas
                </div>
              </div>
              <div className="rounded-xl border border-[var(--ar-gray-200)] p-3">
                <div className="text-2xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
                  {TIEMPO_LIMITE_SEG}s
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
                  Por pregunta
                </div>
              </div>
              <div className="rounded-xl border border-[var(--ar-gray-200)] p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-extrabold tabular-nums text-[var(--ar-blue-500)]">
                  <Zap className="h-5 w-5" strokeWidth={2.5} />
                  {SPEED_BONUS_SEG}s
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
                  Speed bonus
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[var(--ar-gray-50)] p-3 text-xs text-[var(--ar-navy-700)]">
              <strong>Reglas:</strong> respuesta correcta = XP. Si respondes en
              menos de {SPEED_BONUS_SEG}s, recibes bonus extra. Encadena correctas
              para subir tu racha.
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href="/retos"
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ar-gray-200)] px-4 py-3 text-sm font-semibold text-[var(--ar-navy-700)] transition-colors hover:bg-[var(--ar-gray-50)]"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </Link>
              <button
                onClick={comenzar}
                className="ar-bg-green-gradient flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
    <div className="flex min-h-screen flex-col bg-[var(--ar-gray-50)]">
      {/* Header del quiz */}
      <header className="border-b border-[var(--ar-gray-200)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/retos"
            className="rounded-full p-2 text-[var(--ar-navy-500)] transition-colors hover:bg-[var(--ar-gray-100)]"
            title="Abandonar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="truncate text-xs font-semibold text-[var(--ar-navy-500)]">
              {curso.nombre}
            </div>
            <div className="text-base font-bold text-[var(--ar-navy-900)]">
              Pregunta {idx + 1} <span className="text-[var(--ar-navy-500)] text-sm">/ {totalPreg}</span>
            </div>
          </div>
          {racha >= 2 && (
            <div className="flex items-center gap-1 rounded-full bg-[var(--ar-orange-500)]/10 px-3 py-1 text-[var(--ar-orange-500)]">
              <Flame className="h-4 w-4" strokeWidth={2.5} />
              <span className="text-sm font-bold tabular-nums">x{racha}</span>
            </div>
          )}
        </div>
        {/* Barra de progreso de preguntas */}
        <div className="h-1 w-full bg-[var(--ar-gray-100)]">
          <div
            className="ar-bg-green-gradient h-full transition-all"
            style={{ width: `${((idx + (estado === "FEEDBACK" ? 1 : 0)) / totalPreg) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {/* Timer */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ar-navy-700)]">
              <Clock className="h-4 w-4" strokeWidth={2.25} />
              {tiempoRestante.toFixed(1)}s
            </div>
            {speedActivo && estado === "JUGANDO" && (
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ar-blue-500)]">
                <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
                Speed bonus activo
              </div>
            )}
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                DIF_COLOR[pregunta.dificultad]
              }`}
            >
              {pregunta.dificultad}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ar-gray-200)]">
            <div
              className={`h-full transition-all ${
                speedActivo
                  ? "ar-bg-fire-gradient"
                  : tiempoRestante < 5
                    ? "bg-red-500"
                    : "bg-[var(--ar-navy-500)]"
              }`}
              style={{ width: `${pctTiempo}%` }}
            />
          </div>
        </div>

        {/* Pregunta */}
        <div className="rounded-2xl border border-[var(--ar-gray-200)] bg-white p-6 shadow-sm">
          <p className="mb-5 text-base font-medium leading-relaxed text-[var(--ar-navy-900)]">
            {pregunta.enunciado}
          </p>

          <div className="flex flex-col gap-2">
            {pregunta.alternativas.map((alt, i) => {
              const esCorrecta = i === pregunta.correctaIdx;
              const esSeleccionada = i === seleccion;
              const enFeedback = estado === "FEEDBACK";

              let cls = "border-[var(--ar-gray-200)] bg-white hover:border-[var(--ar-blue-500)]/40 hover:bg-[var(--ar-blue-500)]/5";
              if (enFeedback) {
                if (esCorrecta) {
                  cls =
                    "border-[var(--ar-green-600)] bg-[var(--ar-green-600)]/10 text-[var(--ar-green-600)]";
                } else if (esSeleccionada) {
                  cls = "border-red-500 bg-red-50 text-red-700";
                } else {
                  cls = "border-[var(--ar-gray-200)] bg-white opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  disabled={estado !== "JUGANDO"}
                  onClick={() => responder(i)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left text-sm font-medium transition-all disabled:cursor-default ${cls}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      enFeedback && esCorrecta
                        ? "border-[var(--ar-green-600)] bg-[var(--ar-green-600)] text-white"
                        : enFeedback && esSeleccionada
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-[var(--ar-gray-200)] text-[var(--ar-navy-700)]"
                    }`}
                  >
                    {LETRAS[i]}
                  </span>
                  <span className="flex-1">{alt}</span>
                  {enFeedback && esCorrecta && (
                    <CheckCircle2 className="h-5 w-5 text-[var(--ar-green-600)]" />
                  )}
                  {enFeedback && esSeleccionada && !esCorrecta && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {estado === "FEEDBACK" && pregunta.explicacion && (
            <div className="mt-4 rounded-lg border border-[var(--ar-blue-500)]/20 bg-[var(--ar-blue-500)]/5 p-3 text-sm text-[var(--ar-navy-700)]">
              <strong className="text-[var(--ar-blue-500)]">Explicación: </strong>
              {pregunta.explicacion}
            </div>
          )}
        </div>

        {/* Boton siguiente */}
        {estado === "FEEDBACK" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={siguiente}
              className="ar-bg-navy-gradient flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {idx + 1 >= totalPreg ? "Ver resultado" : "Siguiente"}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {estado === "ENVIANDO" && (
          <div className="mt-4 text-center text-sm text-[var(--ar-navy-500)]">
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
    <div className="ar-bg-navy-gradient flex min-h-screen items-start justify-center overflow-y-auto p-6">
      <div className="my-8 w-full max-w-xl">
        {resultado.subioEtapa && (
          <div className="ar-bg-green-gradient mb-4 flex items-center gap-3 rounded-2xl p-5 text-white shadow-xl">
            <Sparkles className="h-8 w-8 shrink-0" strokeWidth={2.5} />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-90">
                ¡Nivel desbloqueado!
              </div>
              <div className="text-lg font-extrabold">
                Avanzaste a la Etapa {resultado.etapaDespues}
              </div>
            </div>
          </div>
        )}

        {resultado.logrosNuevos.length > 0 && (
          <div className="ar-bg-fire-gradient mb-4 rounded-2xl p-5 text-white shadow-xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              Logros desbloqueados
            </div>
            <ul className="space-y-1">
              {resultado.logrosNuevos.map((l) => (
                <li
                  key={l.codigo}
                  className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"
                >
                  <span className="text-sm font-semibold">{l.nombre}</span>
                  <span className="text-xs font-bold">+{l.xpRecompensa} XP</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="ar-bg-navy-gradient px-6 py-5 text-center text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ar-blue-300)]">
              Resultado del reto
            </div>
            <h1 className="mt-1 line-clamp-1 text-lg font-bold">{curso.nombre}</h1>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-[var(--ar-yellow-500)]" />
              <span className="text-4xl font-extrabold tabular-nums">
                {resultado.totalCorrectas}
                <span className="text-2xl text-[var(--ar-blue-300)]">
                  /{resultado.totalPreguntas}
                </span>
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--ar-blue-300)]">
              {pctAciertos}% de precisión
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="XP ganado"
                value={`+${resultado.puntajeFinal}`}
                Icon={TrendingUp}
                color="green"
              />
              <Stat
                label="Monedas"
                value={`+${resultado.monedasGanadas}`}
                Icon={Coins}
                color="yellow"
              />
              <Stat
                label="Gemas"
                value={`+${resultado.gemasGanadas}`}
                Icon={Gem}
                color="blue"
              />
              <Stat
                label="Racha máx."
                value={resultado.rachaMaxPartida}
                Icon={Flame}
                color="orange"
              />
            </div>

            <div className="mt-5 rounded-xl border border-[var(--ar-gray-200)] bg-[var(--ar-gray-50)] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ar-navy-500)]">
                XP total acumulado
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
                  {resultado.xpDespues.toLocaleString("es-PE")}
                </span>
                <span className="text-sm text-[var(--ar-navy-500)]">
                  (antes: {resultado.xpAntes.toLocaleString("es-PE")})
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => router.push("/retos")}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ar-gray-200)] px-4 py-3 text-sm font-semibold text-[var(--ar-navy-700)] transition-colors hover:bg-[var(--ar-gray-50)]"
              >
                <Home className="h-4 w-4" /> Más retos
              </button>
              <button
                onClick={() => router.refresh()}
                className="ar-bg-navy-gradient flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02]"
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
    green: "text-[var(--ar-green-600)]",
    yellow: "text-[var(--ar-yellow-500)]",
    blue: "text-[var(--ar-blue-500)]",
    orange: "text-[var(--ar-orange-500)]",
  };
  return (
    <div className="rounded-xl border border-[var(--ar-gray-200)] bg-white p-3">
      <Icon className={`h-4 w-4 ${colorMap[color]}`} strokeWidth={2.5} />
      <div className="mt-1 text-lg font-extrabold tabular-nums text-[var(--ar-navy-900)]">
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
        {label}
      </div>
    </div>
  );
}
