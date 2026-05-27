import type { LucideIcon } from "lucide-react";
import { Home, Target, Trophy, BookOpen, Award, User } from "lucide-react";

interface NavItem {
  label: string;
  Icon: LucideIcon;
  href: string;
  active?: boolean;
}

const ITEMS: NavItem[] = [
  { label: "Inicio", Icon: Home, href: "/", active: true },
  { label: "Retos", Icon: Target, href: "/retos" },
  { label: "Ranking", Icon: Trophy, href: "/ranking" },
  { label: "Cursos", Icon: BookOpen, href: "/cursos" },
  { label: "Logros", Icon: Award, href: "/logros" },
  { label: "Perfil", Icon: User, href: "/perfil" },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[rgba(59,130,246,0.15)] bg-[rgba(10,37,64,0.95)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-stretch px-2">
        {ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center gap-1 py-3 transition-all duration-200 ${
              item.active
                ? "nav-active-glow text-[var(--ar-green-400)]"
                : "text-[var(--ar-blue-300)]/50 hover:text-[var(--ar-blue-300)]"
            }`}
          >
            <item.Icon
              className={`h-5 w-5 transition-all ${item.active ? "drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]" : ""}`}
              strokeWidth={item.active ? 2.5 : 2}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
