/**
 * Seven-segment visual for relative project scope (accent = more surface area by default).
 * No tier numbering — decorative / supplementary to labels elsewhere.
 */
export function ComplexityDots({
  filled,
  size,
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: {
  filled: number;
  size: 'pill' | 'bar' | 'dot';
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}) {
  const n = Math.min(7, Math.max(0, filled));
  const shape =
    size === 'bar'
      ? 'h-1.5 w-4 rounded-[1px]'
      : size === 'pill'
        ? 'h-[2px] w-[6px] rounded-[1px]'
        : 'h-[3px] w-[3px] rounded-full';
  const gap = size === 'dot' ? 'gap-[3px]' : 'gap-[2px]';

  return (
    <div
      className={`flex shrink-0 ${gap} ${className}`}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden || undefined}
    >
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className={`${shape} ${i < n ? 'bg-accent' : 'bg-rule'}`}
          aria-hidden
        />
      ))}
    </div>
  );
}
