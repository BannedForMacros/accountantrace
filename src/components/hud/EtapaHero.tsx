import Image from "next/image";
import { Medal, Gem, Crown, Trophy } from "lucide-react";
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
  { color: string; Icon: LucideIcon; label: string }
> = {
  plata: { color: "text-slate-300", Icon: Medal, label: "Plata" },
  oro: { color: "text-[var(--ar-yellow-500)]", Icon: Trophy, label: "Oro" },
  diamante: { color: "text-[var(--ar-blue-300)]", Icon: Gem, label: "Diamante" },
  elite: { color: "text-[var(--ar-green-500)]", Icon: Crown, label: "Elite" },
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
    <div className="ar-bg-navy-gradient relative overflow-hidden rounded-2xl shadow-xl">
      <div className="relative aspect-[3/2] w-full">
        <Image
          src={imagen}
          alt={titulo}
          fill
          sizes="(max-width: 768px) 100vw, 75vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ar-navy-900)]/60 via-transparent to-[var(--ar-navy-900)]/30" />

        <div className="absolute left-4 top-4 flex flex-col gap-1">
          <div className="ar-bg-green-gradient inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
            Etapa {etapaId}
          </div>
          <h2 className="max-w-xs text-2xl font-extrabold leading-tight text-white drop-shadow-lg">
            {titulo}
          </h2>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--ar-blue-300)]">
            {nombre}
          </p>
        </div>

        {med && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-[var(--ar-navy-900)]/70 px-3 py-1.5 backdrop-blur">
            <med.Icon className={`h-4 w-4 ${med.color}`} strokeWidth={2.5} />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${med.color}`}
            >
              {med.label}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ar-navy-500)]">
            Progreso
          </div>
          <div className="text-2xl font-extrabold tabular-nums text-[var(--ar-navy-900)]">
            {porcentaje}%
          </div>
        </div>
      </div>
    </div>
  );
}
