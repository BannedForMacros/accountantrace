import { Coins, Gem } from "lucide-react";
import { Logo } from "./Logo";
import { NivelBadge } from "./NivelBadge";
import { XPBar } from "./XPBar";
import { CurrencyChip } from "./CurrencyChip";
import { LogoutButton } from "./LogoutButton";

interface TopBarProps {
  nivel: number;
  xpActual: number;
  xpMeta: number;
  monedas: number;
  gemas: number;
  etapaTitulo?: string;
}

export function TopBar({ nivel, xpActual, xpMeta, monedas, gemas, etapaTitulo }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/30">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 lg:gap-6 lg:px-6">
        <Logo />

        <div className="flex flex-1 items-center gap-3 lg:gap-4">
          <NivelBadge nivel={nivel} />
          {etapaTitulo && (
            <span className="hidden text-xs font-black uppercase tracking-wider text-[var(--ar-yellow-500)] md:block">
              {etapaTitulo}
            </span>
          )}
          <div className="min-w-0 flex-1 max-w-md">
            <XPBar actual={xpActual} meta={xpMeta} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CurrencyChip Icon={Coins} value={monedas} color="yellow" />
          <CurrencyChip Icon={Gem} value={gemas} color="blue" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
