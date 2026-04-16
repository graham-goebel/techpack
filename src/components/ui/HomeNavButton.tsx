interface HomeNavButtonProps {
  onClick: () => void;
  /** Extra Tailwind classes for the button */
  className?: string;
  /** Icon pixel size (viewBox is 24×24) */
  iconSize?: number;
}

export function HomeNavButton({ onClick, className = '', iconSize = 22 }: HomeNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Home"
      title="Home"
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-none border border-rule p-0 text-ink-muted transition-colors sm:size-12 hover:border-rule-strong hover:bg-surface-raised hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 ${className}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
  );
}
