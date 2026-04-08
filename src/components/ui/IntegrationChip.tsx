import { skillsShUrl, type IntegrationItem } from '../../data/integrations';

const TOOLTIP_BASE =
  'pointer-events-none absolute z-[230] left-1/2 -translate-x-1/2 w-[min(17rem,calc(100vw-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[11px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100';

export function IntegrationChip({
  item,
  isActive,
  onToggle,
  idPrefix,
  tooltipPlacement = 'above',
}: {
  item: IntegrationItem;
  isActive: boolean;
  onToggle: () => void;
  idPrefix: string;
  tooltipPlacement?: 'above' | 'below';
}) {
  const descId = `${idPrefix}-int-desc-${item.id}`;
  const href = item.skillsShPath ? skillsShUrl(item.skillsShPath) : item.url;

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
        className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-sm border transition-colors ${
          isActive
            ? 'bg-ink text-surface border-ink'
            : 'bg-surface text-ink-secondary border-rule hover:bg-surface-raised hover:border-neutral-300'
        }`}
      >
        {!isActive && (
          <svg
            className="h-2.5 w-2.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        )}
        {item.name}
        {isActive && (
          <svg
            className="h-2 w-2 shrink-0 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
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
          <p className="mt-2 font-mono text-[9px] leading-snug text-surface/55">{item.installHint}</p>
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
