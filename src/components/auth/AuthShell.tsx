import Image from "next/image";

interface AuthShellProps {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ titulo, subtitulo, children, footer }: AuthShellProps) {
  return (
    <div className="ar-bg-navy-gradient relative flex min-h-screen items-center justify-center px-4 py-8">
      {/* Patrón decorativo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[var(--ar-blue-500)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[var(--ar-green-500)] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo.jpeg"
            alt="AccountantRace"
            width={72}
            height={72}
            className="mb-3 rounded-2xl shadow-lg"
            priority
          />
          <h1 className="text-2xl font-extrabold text-white">
            <span className="text-white">Accountant</span>
            <span className="text-[var(--ar-green-500)]">Race</span>
          </h1>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--ar-blue-300)]">
            Tu carrera. Tu legado. Tu ranking.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-[var(--ar-navy-900)]">
              {titulo}
            </h2>
            <p className="mt-1 text-sm text-[var(--ar-navy-500)]">{subtitulo}</p>
          </div>
          {children}
        </div>

        {footer && (
          <div className="mt-4 text-center text-sm text-white/80">{footer}</div>
        )}
      </div>
    </div>
  );
}
