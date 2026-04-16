import type { BlockLibrary } from '../../types';
import { LibraryBrandIcon } from '../icons/LibraryBrandIcon';

/** Stack: centered. Sidebar: left-aligned so tooltips are not clipped by aside overflow-x-hidden (304px rail). */
const TOOLTIP_BASE_STACK =
  'pointer-events-none absolute z-[230] left-1/2 -translate-x-1/2 w-[min(17rem,calc(100vw-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100';

const TOOLTIP_BASE_SIDEBAR =
  'pointer-events-none absolute z-[230] left-0 translate-x-0 w-max max-w-[min(17rem,calc(360px-52px-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100';

type LibraryChipVariant = 'stack' | 'sidebar' | 'list';

export function LibraryChip({
  lib,
  isActive,
  onToggle,
  size = 'md',
  variant = 'stack',
  idPrefix,
  stopPropagationOnClick,
  tooltipPlacement = 'above',
  /** When `variant` is `list`, whether tooltips use rail-aligned (sidebar) or centered (stack) positioning */
  listTooltipMode = 'sidebar',
}: {
  lib: BlockLibrary;
  isActive: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
  variant?: LibraryChipVariant;
  /** Unique prefix for aria ids (e.g. stack block id or sidebar + block id) */
  idPrefix: string;
  stopPropagationOnClick?: boolean;
  /** Use `below` inside scroll/overflow areas so the panel is not clipped upward */
  tooltipPlacement?: 'above' | 'below';
  listTooltipMode?: 'sidebar' | 'stack';
}) {
  const descId = `${idPrefix}-lib-desc-${lib.id}`;

  if (variant === 'list') {
    const tooltipBase = listTooltipMode === 'stack' ? TOOLTIP_BASE_STACK : TOOLTIP_BASE_SIDEBAR;
    return (
      <div className="group relative w-full min-w-0">
        <span id={descId} className="sr-only">
          {lib.description}
          {lib.url ? ` Documentation: ${lib.url}` : ''}
        </span>
        <button
          type="button"
          aria-describedby={descId}
          aria-pressed={isActive}
          data-chip-size={size}
          onClick={(e) => {
            if (stopPropagationOnClick) e.stopPropagation();
            onToggle();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        >
          <LibraryBrandIcon libraryId={lib.id} name={lib.name} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold leading-tight text-ink">{lib.name}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-ink-muted line-clamp-2">{lib.description}</p>
          </div>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              isActive ? 'bg-surface-raised text-ink' : 'bg-transparent text-ink-muted hover:bg-surface-raised'
            }`}
            aria-hidden
          >
            {isActive ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            )}
          </span>
        </button>
        <div
          role="tooltip"
          className={`${tooltipBase} ${
            tooltipPlacement === 'below' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]'
          }`}
        >
          <p className="mb-1 font-semibold text-surface">{lib.name}</p>
          <p className="leading-relaxed text-surface/85">{lib.description}</p>
          {lib.url ? (
            <p className="mt-2 border-t border-white/15 pt-2 font-mono text-[10px] leading-snug text-surface/55 break-all">
              {lib.url}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const sizeClasses =
    'inline-flex items-center gap-px px-1 py-px text-[4px] font-medium leading-none rounded-sm border transition-colors';

  const variantClasses =
    variant === 'sidebar'
      ? isActive
        ? 'bg-surface text-ink border-ink/30'
        : 'bg-transparent text-ink-faint border-rule hover:text-ink-secondary hover:border-rule-strong'
      : isActive
        ? 'bg-ink text-surface border-ink'
        : 'bg-surface text-ink-secondary border-rule hover:bg-surface-raised hover:border-neutral-300';

  const tooltipBase = variant === 'sidebar' ? TOOLTIP_BASE_SIDEBAR : TOOLTIP_BASE_STACK;

  return (
    <span className="group relative inline-flex max-w-full">
      <span id={descId} className="sr-only">
        {lib.description}
        {lib.url ? ` Documentation: ${lib.url}` : ''}
      </span>
      <button
        type="button"
        aria-describedby={descId}
        data-chip-size={size}
        onClick={(e) => {
          if (stopPropagationOnClick) e.stopPropagation();
          onToggle();
        }}
        className={`${sizeClasses} ${variantClasses}`}
      >
        {!isActive && (
          <svg
            className="h-[4px] w-[4px] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        )}
        {lib.name}
        {isActive && (
          <svg
            className={`h-1 w-1 shrink-0 ${variant === 'sidebar' ? 'text-ink-faint' : 'opacity-80'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden
          >
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
      <div
        role="tooltip"
        className={`${tooltipBase} ${
          tooltipPlacement === 'below' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]'
        }`}
      >
        <p className="mb-1 font-semibold text-surface">{lib.name}</p>
        <p className="leading-relaxed text-surface/85">{lib.description}</p>
        {lib.url ? (
          <p className="mt-2 border-t border-white/15 pt-2 font-mono text-[10px] leading-snug text-surface/55 break-all">
            {lib.url}
          </p>
        ) : null}
      </div>
    </span>
  );
}
