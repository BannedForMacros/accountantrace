import Image from "next/image";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.jpeg"
        alt="AccountantRace"
        width={size}
        height={size}
        className="rounded-lg object-contain ring-1 ring-white/10"
        priority
      />
      <div className="flex flex-col leading-tight">
        <span className="text-base font-bold tracking-tight">
          <span className="text-white">Accountant</span>
          <span className="text-[var(--ar-green-400)]">Race</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--ar-blue-300)]/50">
          Tu carrera. Tu legado. Tu ranking.
        </span>
      </div>
    </div>
  );
}
