import type { SimpleIcon } from 'simple-icons';
import {
  siAircall,
  siAnthropic,
  siAxios,
  siBrave,
  siCloudflare,
  siCurl,
  siDiscord,
  siFiles,
  siGithub,
  siMapbox,
  siModelcontextprotocol,
  siOpenapiinitiative,
  siPostgresql,
  siReact,
  siResend,
  siStripe,
  siSupabase,
  siSwift,
  siVercel,
  siYoutube,
  siZod,
} from 'simple-icons';
import type { IntegrationCategory } from '../../data/integrations';
import { INTEGRATION_CAT_ICON } from '../../data/integrationCategoryStyles';
import { OPENAI_BRAND_HEX, OPENAI_BRAND_PATH } from '../../icons/openaiBrand';

function SvgSimple({
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
 * Curated simple-icons + OpenAI path for every integration catalog id.
 * (Slack uses Discord as a stand-in — no Slack glyph in simple-icons v16.)
 */
const INTEGRATION_SIMPLE: Record<string, SimpleIcon> = {
  'skill-find-skills': siModelcontextprotocol,
  'skill-frontend-design': siAnthropic,
  'skill-web-design-guidelines': siVercel,
  'skill-vercel-react': siReact,
  'skill-skill-creator': siAnthropic,
  'skill-remotion': siYoutube,
  'skill-composition-patterns': siVercel,
  'skill-swiftui': siSwift,
  'mcp-filesystem': siFiles,
  'mcp-github': siGithub,
  'mcp-postgres': siPostgresql,
  'mcp-fetch': siCurl,
  'mcp-slack': siDiscord,
  'mcp-brave': siBrave,
  'api-anthropic': siAnthropic,
  'api-stripe': siStripe,
  'api-resend': siResend,
  'api-supabase': siSupabase,
  'api-mapbox': siMapbox,
  'api-twilio': siAircall,
  'api-cloudflare': siCloudflare,
  'intlib-axios': siAxios,
  'intlib-zod': siZod,
  'intlib-stripe-node': siStripe,
  'intlib-alamofire': siSwift,
  'intlib-swift-openapi': siOpenapiinitiative,
};

const OPENAI_IDS = new Set(['api-openai', 'intlib-openai-node']);

export function IntegrationBrandIcon({
  integrationId,
  name,
  category,
  className = '',
}: {
  integrationId: string;
  name: string;
  category: IntegrationCategory;
  className?: string;
}) {
  if (OPENAI_IDS.has(integrationId)) {
    const fill = `#${OPENAI_BRAND_HEX}`;
    return (
      <div className={`${tileClass} ${className}`} aria-hidden>
        <svg viewBox="0 0 24 24" className="h-6 w-6" role="img" aria-hidden>
          <title>OpenAI</title>
          <path fill={fill} d={OPENAI_BRAND_PATH} />
        </svg>
      </div>
    );
  }

  const icon = INTEGRATION_SIMPLE[integrationId];
  if (!icon) {
    const tint = INTEGRATION_CAT_ICON[category];
    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${tint} ${className}`}
        aria-hidden
      >
        {(name.trim().slice(0, 1) || '?').toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${tileClass} ${className}`} aria-hidden>
      <SvgSimple icon={icon} title={icon.title} className="h-6 w-6" />
    </div>
  );
}
