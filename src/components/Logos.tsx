import Image from "next/image";

export function SmartStayLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-28 w-48 sm:h-32 sm:w-56 ${className}`} aria-label="Smart Stay">
      <Image
        src="/logos/smart-stay.svg"
        alt="Smart Stay"
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  );
}

export function SunnoBlueLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-16 w-48 sm:h-20 sm:w-60 ${className}`} aria-label="Sunno Blue">
      <Image
        src="/logos/sunno-blue.svg"
        alt="Sunno Blue"
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  );
}

/** Barra de marcas usada en el header y el hero. */
export function BrandBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${className}`}>
      <SmartStayLogo />
      <span className="hidden h-16 w-px bg-navy-900/15 sm:block" />
      <SunnoBlueLogo />
    </div>
  );
}
