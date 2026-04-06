interface HomeNavButtonProps {
  onClick: () => void;
  /** Extra Tailwind classes for the button */
  className?: string;
  /** Icon pixel size (viewBox is 24×24) */
  iconSize?: number;
}

export function HomeNavButton({ onClick, className = '', iconSize = 18 }: HomeNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Home"
      title="Home"
      className={`inline-flex shrink-0 items-center justify-center rounded-md border border-rule p-2 text-ink-muted transition-colors hover:border-rule-strong hover:bg-surface-raised hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 ${className}`}
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
