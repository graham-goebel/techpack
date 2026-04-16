interface FloatingWorkspaceExitButtonProps {
  onClick: () => void;
  /** Defaults match home “+” floating control. */
  ariaLabel?: string;
}

/** Same chrome and viewport position as `PromptsHomePage` “+” — × exits workspace flows without saving. */
export function FloatingWorkspaceExitButton({
  onClick,
  ariaLabel = 'Close without saving',
}: FloatingWorkspaceExitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="fixed top-4 right-4 z-40 flex size-11 shrink-0 items-center justify-center rounded-none sm:top-6 sm:right-6 sm:size-12 text-surface bg-ink hover:opacity-90 transition-opacity border border-ink shadow-[0_12px_40px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <svg
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}
