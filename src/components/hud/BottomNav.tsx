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
    <nav className="sticky bottom-0 z-30 border-t border-[var(--ar-gray-200)] bg-white">
      <div className="mx-auto flex max-w-7xl items-stretch px-2">
        {ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
              item.active
                ? "text-[var(--ar-green-600)]"
                : "text-[var(--ar-navy-500)] hover:text-[var(--ar-navy-900)]"
            }`}
          >
            <item.Icon className="h-5 w-5" strokeWidth={2.25} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {item.label}
            </span>
            {item.active && (
              <span className="mt-0.5 h-0.5 w-6 rounded-full bg-[var(--ar-green-600)]" />
            )}
          </a>
        ))}
      </div>
    </nav>
  );
}
