import type { SimpleIcon } from 'simple-icons';
import {
  siD3,
  siDatefns,
  siFramer,
  siGooglefonts,
  siGsap,
  siHeadlessui,
  siLucide,
  siLottiefiles,
  siPhosphoricons,
  siRadixui,
  siReact,
  siReacthookform,
  siShadcnui,
  siTailwindcss,
  siTanstack,
  siTrello,
  siVite,
  siZap,
} from 'simple-icons';

/** Tabler Icons — not in Simple Icons; grid mark + brand blue (tabler.io). */
const TABLER_BRAND_HEX = '206bc4';
const TABLER_GRID_PATH =
  'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z';

const LIBRARY_ICONS: Record<string, SimpleIcon> = {
  heroicons: siTailwindcss,
  lucide: siLucide,
  phosphor: siPhosphoricons,
  'framer-motion': siFramer,
  gsap: siGsap,
  'auto-animate': siVite,
  'tailwind-animate': siTailwindcss,
  lottie: siLottiefiles,
  'shadcn-ui': siShadcnui,
  'radix-primitives': siRadixui,
  'headless-ui': siHeadlessui,
  'react-aria': siReact,
  fontsource: siGooglefonts,
  'google-fonts': siGooglefonts,
  'react-hook-form': siReacthookform,
  'tanstack-query': siTanstack,
  'tanstack-table': siTanstack,
  'dnd-kit': siTrello,
  recharts: siD3,
  'date-fns': siDatefns,
  sonner: siZap,
};

function SvgBrand({
  icon,
  className,
  title,
}: {
  icon: SimpleIcon;
  className?: string;
  title: string;
}) {
  const fill = `#${icon.hex}`;
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-hidden>
      <title>{title}</title>
      <path fill={fill} d={icon.path} />
    </svg>
  );
}

const tileClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rule/60 bg-surface-raised';

/**
 * Official brand marks (Simple Icons CC0) where available; initials otherwise.
 */
export function LibraryBrandIcon({
  libraryId,
  name,
  className = '',
}: {
  libraryId: string;
  name: string;
  className?: string;
}) {
  if (libraryId === 'tabler-icons') {
    const fill = `#${TABLER_BRAND_HEX}`;
    return (
      <div className={`${tileClass} ${className}`} aria-hidden>
        <svg viewBox="0 0 24 24" className="h-6 w-6" role="img" aria-hidden>
          <title>Tabler Icons</title>
          <path fill={fill} d={TABLER_GRID_PATH} />
        </svg>
      </div>
    );
  }

  const icon = LIBRARY_ICONS[libraryId];
  if (!icon) {
    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-sm font-semibold text-ink-secondary ${className}`}
        aria-hidden
      >
        {(name.trim().slice(0, 1) || '?').toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${tileClass} ${className}`} aria-hidden>
      <SvgBrand icon={icon} title={icon.title} className="h-6 w-6" />
    </div>
  );
}
