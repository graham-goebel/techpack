import { useEffect, useId, useRef, useState, type PointerEventHandler } from 'react';

export type CustomSelectOption = {
  value: string;
  label: string;
  /** Shown under the label in the dropdown list only (not on the closed trigger) */
  description?: string;
};

export type CustomSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Shown when value does not match any option */
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
  /** Extra classes on the options panel (e.g. max height) */
  listClassName?: string;
  /** e.g. stopPropagation when nested in clickable rows */
  onTriggerPointerDown?: PointerEventHandler<HTMLButtonElement>;
};

export function CustomSelect({
  id: idProp,
  value,
  onChange,
  options,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  placeholder = 'Select…',
  size = 'md',
  className = '',
  listClassName = '',
  onTriggerPointerDown,
}: CustomSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-1.5 text-[11px] rounded-md min-h-[34px]'
      : 'px-3 py-2 text-sm rounded-md min-h-[42px]';

  const optionText = size === 'sm' ? 'text-[11px]' : 'text-sm';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onPointerDown={onTriggerPointerDown}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        className={`flex w-full items-center justify-between gap-2 border border-rule bg-surface text-left text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${
          open ? 'border-ink/25 ring-1 ring-ink/10' : 'hover:bg-surface-raised'
        }`}
      >
        <span className="min-w-0 flex-1 truncate font-medium text-ink">{displayLabel}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabel}
          className={`absolute left-0 right-0 z-[230] mt-1 max-h-[min(16rem,45vh)] overflow-y-auto rounded-md border border-rule bg-surface py-1 shadow-md ${listClassName}`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const optPad = size === 'sm' ? 'px-2 py-1.5 gap-1.5' : 'px-3 py-2 gap-2';
            const dotMt = size === 'sm' ? 'mt-1' : 'mt-1.5';
            const dotSz = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
            return (
              <button
                key={`${opt.value}-${idx}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-start text-left transition-colors ${optPad} ${optionText} ${
                  isSelected
                    ? 'bg-surface-raised text-ink font-semibold'
                    : 'text-ink-secondary hover:bg-surface-raised'
                }`}
              >
                <span
                  className={`${dotMt} ${dotSz} shrink-0 rounded-full border-2 ${
                    isSelected ? 'border-ink bg-ink' : 'border-ink-faint'
                  }`}
                  aria-hidden
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug">
                  <span className={isSelected ? 'text-ink' : 'text-ink-secondary'}>{opt.label}</span>
                  {opt.description ? (
                    <span
                      className={`line-clamp-3 text-[10px] font-normal leading-snug ${
                        isSelected ? 'text-ink-muted' : 'text-ink-faint'
                      }`}
                    >
                      {opt.description}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
