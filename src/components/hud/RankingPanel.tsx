import { Trophy, Medal } from "lucide-react";

interface RankingItem {
  posicion: number;
  nombre: string;
  xp: number;
  esTu?: boolean;
}

const DEMO_RANKING: RankingItem[] = [
  { posicion: 1, nombre: "Maria G.", xp: 5450 },
  { posicion: 2, nombre: "Juan P.", xp: 4920 },
  { posicion: 3, nombre: "Sofia R.", xp: 4560 },
  { posicion: 128, nombre: "Tu (demo)", xp: 0, esTu: true },
];

function PosicionIcon({ posicion }: { posicion: number }) {
  if (posicion === 1) {
    return <Trophy className="h-5 w-5 text-[var(--ar-yellow-500)]" strokeWidth={2.5} />;
  }
  if (posicion === 2) {
    return <Medal className="h-5 w-5 text-slate-400" strokeWidth={2.5} />;
  }
  if (posicion === 3) {
    return <Medal className="h-5 w-5 text-[var(--ar-orange-500)]" strokeWidth={2.5} />;
  }
  return (
    <span className="text-xs font-bold text-[var(--ar-navy-500)]">
      #{posicion}
    </span>
  );
}

export function RankingPanel({ items = DEMO_RANKING }: { items?: RankingItem[] }) {
  return (
    <div className="rounded-xl border border-[var(--ar-gray-200)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--ar-gray-200)] px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--ar-navy-900)]">
          <Trophy className="h-4 w-4 text-[var(--ar-yellow-500)]" strokeWidth={2.5} />
          Ranking
        </h3>
        <span className="text-xs font-medium text-[var(--ar-navy-500)]">Top 3</span>
      </div>
      <ul className="divide-y divide-[var(--ar-gray-100)]">
        {items.map((it) => (
          <li
            key={it.posicion}
            className={`flex items-center gap-3 px-4 py-2.5 ${
              it.esTu ? "bg-[var(--ar-green-600)]/10" : ""
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <PosicionIcon posicion={it.posicion} />
            </span>
            <span
              className={`flex-1 truncate text-sm ${
                it.esTu
                  ? "font-bold text-[var(--ar-green-600)]"
                  : "font-medium text-[var(--ar-navy-900)]"
              }`}
            >
              {it.nombre}
            </span>
            <span className="text-xs font-semibold tabular-nums text-[var(--ar-navy-700)]">
              {it.xp.toLocaleString("es-PE")} XP
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
