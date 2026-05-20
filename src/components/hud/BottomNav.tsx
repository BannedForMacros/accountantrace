interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

const ITEMS: NavItem[] = [
  { label: "Inicio", icon: "🏠", href: "/", active: true },
  { label: "Retos", icon: "🎯", href: "/retos" },
  { label: "Ranking", icon: "🏆", href: "/ranking" },
  { label: "Cursos", icon: "📚", href: "/cursos" },
  { label: "Logros", icon: "🎖️", href: "/logros" },
  { label: "Perfil", icon: "👤", href: "/perfil" },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--ar-gray-200)] bg-white">
      <div className="mx-auto flex max-w-7xl items-stretch px-2">
        {ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 transition-colors ${
              item.active
                ? "text-[var(--ar-green-600)]"
                : "text-[var(--ar-navy-500)] hover:text-[var(--ar-navy-900)]"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
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
