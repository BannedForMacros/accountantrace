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
}

export function TopBar({ nivel, xpActual, xpMeta, monedas, gemas }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ar-gray-200)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Logo />

        <div className="flex flex-1 items-center gap-4">
          <NivelBadge nivel={nivel} />
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
