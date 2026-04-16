import { skillsShUrl, type IntegrationItem } from '../../data/integrations';
import { IntegrationBrandIcon } from '../icons/IntegrationBrandIcon';

const TOOLTIP_BASE_STACK =
  'pointer-events-none absolute z-[230] left-1/2 -translate-x-1/2 w-[min(17rem,calc(100vw-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100';

const TOOLTIP_BASE_SIDEBAR =
  'pointer-events-none absolute z-[230] left-0 translate-x-0 w-max max-w-[min(17rem,calc(360px-52px-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100';

const TOOLTIP_BASE = TOOLTIP_BASE_STACK;

type IntegrationChipVariant = 'chip' | 'list';

export function IntegrationChip({
  item,
  isActive,
  onToggle,
  idPrefix,
  tooltipPlacement = 'above',
  variant = 'chip',
  listTooltipMode = 'stack',
}: {
  item: IntegrationItem;
  isActive: boolean;
  onToggle: () => void;
  idPrefix: string;
  tooltipPlacement?: 'above' | 'below';
  variant?: IntegrationChipVariant;
  /** When `variant` is `list`, tooltip alignment (stack panel vs sidebar). */
  listTooltipMode?: 'sidebar' | 'stack';
}) {
  const descId = `${idPrefix}-int-desc-${item.id}`;
  const href = item.skillsShPath ? skillsShUrl(item.skillsShPath) : item.url;
  if (variant === 'list') {
    const tooltipBase = listTooltipMode === 'stack' ? TOOLTIP_BASE_STACK : TOOLTIP_BASE_SIDEBAR;
    return (
      <div className="group relative w-full min-w-0">
        <span id={descId} className="sr-only">
          {item.description}
          {item.installHint ? ` ${item.installHint}` : ''}
          {href ? ` ${href}` : ''}
        </span>
        <button
          type="button"
          aria-describedby={descId}
          aria-pressed={isActive}
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        >
          <IntegrationBrandIcon integrationId={item.id} name={item.name} category={item.category} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold leading-tight text-ink">{item.name}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-ink-muted line-clamp-2">{item.description}</p>
            {item.installHint ? (
              <p className="mt-1 font-mono text-[10px] leading-tight text-ink-faint line-clamp-1">{item.installHint}</p>
            ) : null}
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
          <p className="mb-1 font-semibold text-surface">{item.name}</p>
          <p className="leading-relaxed text-surface/85">{item.description}</p>
          {item.installHint ? (
            <p className="mt-2 font-mono text-[10px] leading-snug text-surface/55">{item.installHint}</p>
          ) : null}
          {href ? (
            <p className="mt-2 border-t border-white/15 pt-2 font-mono text-[10px] leading-snug text-surface/55 break-all">
              {href}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <span className="group relative inline-flex max-w-full">
      <span id={descId} className="sr-only">
        {item.description}
        {item.installHint ? ` ${item.installHint}` : ''}
        {href ? ` ${href}` : ''}
      </span>
      <button
        type="button"
        aria-describedby={descId}
        onClick={onToggle}
        className={`inline-flex items-center gap-px px-1 py-px text-[4px] font-medium leading-none rounded-sm border transition-colors ${
          isActive
            ? 'bg-ink text-surface border-ink'
            : 'bg-surface text-ink-secondary border-rule hover:bg-surface-raised hover:border-neutral-300'
        }`}
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
        {item.name}
        {isActive && (
          <svg
            className="h-1 w-1 shrink-0 opacity-80"
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
        className={`${TOOLTIP_BASE} ${
          tooltipPlacement === 'below' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]'
        }`}
      >
        <p className="mb-1 font-semibold text-surface">{item.name}</p>
        <p className="leading-relaxed text-surface/85">{item.description}</p>
        {item.installHint ? (
          <p className="mt-2 font-mono text-[10px] leading-snug text-surface/55">{item.installHint}</p>
        ) : null}
        {href ? (
          <p className="mt-2 border-t border-white/15 pt-2 font-mono text-[10px] leading-snug text-surface/55 break-all">
            {href}
          </p>
        ) : null}
      </div>
    </span>
  );
}
