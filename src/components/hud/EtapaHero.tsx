import Image from "next/image";
import { Medal, Gem, Crown, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EtapaHeroProps {
  etapaId: number;
  nombre: string;
  titulo: string;
  porcentaje: number;
  imagen: string;
  medalla?: string | null;
}

const MEDALLAS: Record<
  string,
  { color: string; Icon: LucideIcon; label: string; glow: string }
> = {
  plata: { color: "text-slate-300", Icon: Medal, label: "Plata", glow: "shadow-[0_0_12px_rgba(148,163,184,0.5)]" },
  oro: { color: "text-[var(--ar-yellow-500)]", Icon: Trophy, label: "Oro", glow: "shadow-[0_0_12px_rgba(234,179,8,0.5)]" },
  diamante: { color: "text-[var(--ar-blue-300)]", Icon: Gem, label: "Diamante", glow: "shadow-[0_0_12px_rgba(147,197,253,0.5)]" },
  elite: { color: "text-[var(--ar-green-500)]", Icon: Crown, label: "Elite", glow: "shadow-[0_0_12px_rgba(34,197,94,0.5)]" },
};

export function EtapaHero({
  etapaId,
  nombre,
  titulo,
  porcentaje,
  imagen,
  medalla,
}: EtapaHeroProps) {
  const med = medalla ? MEDALLAS[medalla] : null;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
      <div className="relative aspect-[3/2] w-full">
        <Image
          src={imagen}
          alt={titulo}
          fill
          sizes="(max-width: 768px) 100vw, 75vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060E1A] via-transparent to-[#060E1A]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060E1A]/50 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="glow-green inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--ar-green-600)] to-[var(--ar-green-500)] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              Etapa {etapaId}
            </div>
          </div>
          <h2 className="max-w-xs text-2xl font-black leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {titulo}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ar-blue-300)]/70">
            {nombre}
          </p>
        </div>

        {med && (
          <div className={`absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-[var(--ar-navy-900)]/80 px-3 py-2 backdrop-blur-sm ring-1 ring-white/10 ${med.glow}`}>
            <med.Icon className={`h-4 w-4 ${med.color}`} strokeWidth={2.5} />
            <span className={`text-xs font-black uppercase tracking-wider ${med.color}`}>
              {med.label}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex-1" />
          <div className="rounded-xl bg-[var(--ar-navy-900)]/80 px-5 py-3 shadow-lg backdrop-blur-sm ring-1 ring-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ar-blue-300)]/60">
              Progreso
            </div>
            <div className="text-3xl font-black tabular-nums text-white">
              {porcentaje}<span className="text-lg text-[var(--ar-green-400)]">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
