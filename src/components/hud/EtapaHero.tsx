import Image from "next/image";

interface EtapaHeroProps {
  etapaId: number;
  nombre: string;
  titulo: string;
  porcentaje: number;
  imagen: string;
  medalla?: string | null;
}

const MEDALLAS: Record<string, { color: string; emoji: string; label: string }> = {
  plata: { color: "text-slate-300", emoji: "🥈", label: "Plata" },
  oro: { color: "text-[var(--ar-yellow-500)]", emoji: "🥇", label: "Oro" },
  diamante: { color: "text-[var(--ar-blue-300)]", emoji: "💎", label: "Diamante" },
  elite: { color: "text-[var(--ar-green-500)]", emoji: "🏆", label: "Elite" },
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
      {/* Imagen como fondo */}
      <div className="relative aspect-[3/2] w-full">
        <Image
          src={imagen}
          alt={titulo}
          fill
          sizes="(max-width: 768px) 100vw, 75vw"
          className="object-cover"
          priority
        />
        {/* Overlay sutil para legibilidad de texto encima */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ar-navy-900)]/60 via-transparent to-[var(--ar-navy-900)]/30" />

        {/* Badge etapa arriba izquierda */}
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

        {/* Medalla arriba derecha */}
        {med && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-[var(--ar-navy-900)]/70 px-3 py-1.5 backdrop-blur">
            <span className="text-base leading-none">{med.emoji}</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${med.color}`}>
              {med.label}
            </span>
          </div>
        )}

        {/* Porcentaje en grande abajo derecha */}
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
