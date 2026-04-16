import type { SimpleIcon } from 'simple-icons';
import { siClaude, siCursor, siStackblitz, siV0 } from 'simple-icons';
import { OPENAI_BRAND_PATH } from '../../icons/openaiBrand';

/** Lovable — not in Simple Icons; rounded heart approximating their mark (brand color). */
const LOVABLE_PATH =
  'M12 20.35c-.12 0-.24-.04-.34-.12C6.6 15.8 4 13.2 4 9.5 4 6.7 6.05 4.65 8.75 4.65c1.45 0 2.8.72 3.6 1.85.82-1.13 2.15-1.85 3.6-1.85 2.7 0 4.75 2.05 4.75 4.85 0 3.7-2.6 6.3-7.66 10.73-.1.08-.22.12-.34.12Z';

function SvgSimpleIcon({ icon, className }: { icon: SimpleIcon; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden role="img">
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

/**
 * Company / product marks for AI coding tools (CustomSelect, sidebar).
 * Paths from [Simple Icons](https://simpleicons.org/) (CC0) where available.
 */
export function ToolLogoGlyph({
  toolId,
  className = '',
}: {
  toolId: string;
  className?: string;
}) {
  const cn = `shrink-0 ${className}`;

  switch (toolId) {
    case 'cursor':
      return <SvgSimpleIcon icon={siCursor} className={cn} />;
    case 'claude-code':
      return <SvgSimpleIcon icon={siClaude} className={cn} />;
    case 'codex':
      return (
        <svg viewBox="0 0 24 24" className={cn} aria-hidden role="img">
          <path fill="currentColor" d={OPENAI_BRAND_PATH} />
        </svg>
      );
    case 'v0':
      return <SvgSimpleIcon icon={siV0} className={cn} />;
    case 'bolt':
      return <SvgSimpleIcon icon={siStackblitz} className={cn} />;
    case 'lovable':
      return (
        <svg viewBox="0 0 24 24" className={cn} aria-hidden role="img">
          <path fill="#FF4D6B" d={LOVABLE_PATH} />
        </svg>
      );
    default:
      return (
        <span
          className={`h-2 w-2 shrink-0 rounded-full border-2 border-ink-faint ${className}`}
          aria-hidden
        />
      );
  }
}
