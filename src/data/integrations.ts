import type { Tier } from '../types';

export type IntegrationCategory = 'skill' | 'mcp' | 'api' | 'library';

export const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  skill: 'Skills',
  mcp: 'MCPs',
  api: 'APIs',
  library: 'Libraries',
};

export const INTEGRATION_CATEGORY_ORDER: IntegrationCategory[] = [
  'skill',
  'mcp',
  'api',
  'library',
];

/** Curated integrations; skills link to the open directory at https://skills.sh */
export interface IntegrationItem {
  id: string;
  category: IntegrationCategory;
  name: string;
  description: string;
  /** Path on skills.sh (e.g. anthropics/skills/frontend-design) */
  skillsShPath?: string;
  url?: string;
  /** e.g. npx skillsadd … */
  installHint?: string;
  /** Empty = relevant for all project types */
  projectTypes: string[];
  minTier: Tier;
  maxTier: Tier;
  /** When non-empty and description has text, item also appears if any keyword matches */
  matchKeywords?: string[];
}

const SKILLS_BASE = 'https://skills.sh/';

export function skillsShUrl(path: string): string {
  return `${SKILLS_BASE}${path.replace(/^\//, '')}`;
}

export const integrationCatalog: IntegrationItem[] = [
  // ── Skills (skills.sh) ─────────────────────────────────────────
  {
    id: 'skill-find-skills',
    category: 'skill',
    name: 'find-skills',
    description: 'Discover and add agent skills from the ecosystem (skills.sh).',
    skillsShPath: 'vercel-labs/skills/find-skills',
    installHint: 'Browse & install via skills.sh or npx skillsadd',
    projectTypes: [],
    minTier: 1,
    maxTier: 7,
  },
  {
    id: 'skill-frontend-design',
    category: 'skill',
    name: 'frontend-design',
    description: 'UI implementation guidance for distinctive, production-grade interfaces.',
    skillsShPath: 'anthropics/skills/frontend-design',
    installHint: 'npx skillsadd (see skills.sh for exact package)',
    projectTypes: ['mood-board', 'prototype', 'website', 'web-app', 'saas', 'platform', 'markdown'],
    minTier: 1,
    maxTier: 7,
  },
  {
    id: 'skill-web-design-guidelines',
    category: 'skill',
    name: 'web-design-guidelines',
    description: 'Web interface patterns and accessibility-minded design checks.',
    skillsShPath: 'vercel-labs/agent-skills/web-design-guidelines',
    projectTypes: ['website', 'web-app', 'saas', 'platform', 'prototype'],
    minTier: 3,
    maxTier: 7,
  },
  {
    id: 'skill-vercel-react',
    category: 'skill',
    name: 'vercel-react-best-practices',
    description: 'React and Next.js performance and composition patterns.',
    skillsShPath: 'vercel-labs/agent-skills/vercel-react-best-practices',
    projectTypes: ['prototype', 'website', 'web-app', 'saas', 'platform', 'plugin-extension'],
    minTier: 3,
    maxTier: 7,
    matchKeywords: ['react', 'next', 'next.js', 'vite'],
  },
  {
    id: 'skill-skill-creator',
    category: 'skill',
    name: 'skill-creator',
    description: 'Author and structure new agent skills (SKILL.md workflows).',
    skillsShPath: 'anthropics/skills/skill-creator',
    projectTypes: ['markdown'],
    minTier: 1,
    maxTier: 7,
    matchKeywords: ['skill', 'cursor', 'agent', 'claude', 'rule'],
  },
  {
    id: 'skill-remotion',
    category: 'skill',
    name: 'remotion-best-practices',
    description: 'Video compositions and Remotion/React video pipelines.',
    skillsShPath: 'remotion-dev/skills/remotion-best-practices',
    projectTypes: [],
    minTier: 3,
    maxTier: 7,
    matchKeywords: ['video', 'remotion', 'animation'],
  },
  {
    id: 'skill-composition-patterns',
    category: 'skill',
    name: 'vercel-composition-patterns',
    description: 'Composable UI and server/client boundaries for React apps.',
    skillsShPath: 'vercel-labs/agent-skills/vercel-composition-patterns',
    projectTypes: ['web-app', 'saas', 'platform'],
    minTier: 4,
    maxTier: 7,
  },
  {
    id: 'skill-swiftui',
    category: 'skill',
    name: 'swiftui-patterns',
    description: 'Apple platform UI patterns (community skills — search skills.sh for Swift/SwiftUI).',
    url: 'https://skills.sh/?q=swift',
    projectTypes: ['ios-mac-app'],
    minTier: 5,
    maxTier: 7,
  },

  // ── MCP servers ────────────────────────────────────────────────
  {
    id: 'mcp-filesystem',
    category: 'mcp',
    name: 'Filesystem MCP',
    description: 'Let agents read/write files in allowed directories (official reference server).',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    projectTypes: [],
    minTier: 2,
    maxTier: 7,
  },
  {
    id: 'mcp-github',
    category: 'mcp',
    name: 'GitHub MCP',
    description: 'Repos, issues, PRs, and search via Model Context Protocol.',
    url: 'https://github.com/github/github-mcp-server',
    projectTypes: ['web-app', 'saas', 'platform', 'plugin-extension'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['github', 'git', 'pr', 'pull request'],
  },
  {
    id: 'mcp-postgres',
    category: 'mcp',
    name: 'PostgreSQL MCP',
    description: 'Query and inspect Postgres databases through MCP.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    projectTypes: ['web-app', 'saas', 'platform'],
    minTier: 5,
    maxTier: 7,
    matchKeywords: ['postgres', 'sql', 'database'],
  },
  {
    id: 'mcp-fetch',
    category: 'mcp',
    name: 'Fetch / web MCP',
    description: 'HTTP fetch and simple web retrieval for agents.',
    url: 'https://github.com/modelcontextprotocol/servers',
    projectTypes: [],
    minTier: 3,
    maxTier: 7,
  },
  {
    id: 'mcp-slack',
    category: 'mcp',
    name: 'Slack MCP',
    description: 'Slack workspace integration for bots and workflows.',
    url: 'https://github.com/modelcontextprotocol/servers',
    projectTypes: ['saas', 'platform'],
    minTier: 5,
    maxTier: 7,
    matchKeywords: ['slack', 'chat', 'notification'],
  },
  {
    id: 'mcp-brave',
    category: 'mcp',
    name: 'Brave Search MCP',
    description: 'Web search results for agents (requires API key).',
    url: 'https://github.com/brave/brave-search-mcp-server',
    projectTypes: [],
    minTier: 3,
    maxTier: 7,
    matchKeywords: ['search', 'research', 'web'],
  },

  // ── APIs (third-party) ───────────────────────────────────────────
  {
    id: 'api-openai',
    category: 'api',
    name: 'OpenAI API',
    description: 'GPT models, embeddings, and assistants for product features.',
    url: 'https://platform.openai.com/docs',
    projectTypes: ['web-app', 'saas', 'platform', 'plugin-extension', 'prototype'],
    minTier: 3,
    maxTier: 7,
    matchKeywords: ['openai', 'gpt', 'llm', 'ai', 'chatbot'],
  },
  {
    id: 'api-anthropic',
    category: 'api',
    name: 'Anthropic API',
    description: 'Claude models for apps and agent backends.',
    url: 'https://docs.anthropic.com',
    projectTypes: ['web-app', 'saas', 'platform'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['anthropic', 'claude', 'llm'],
  },
  {
    id: 'api-stripe',
    category: 'api',
    name: 'Stripe',
    description: 'Payments, subscriptions, and billing webhooks.',
    url: 'https://stripe.com/docs',
    projectTypes: ['saas', 'platform', 'web-app'],
    minTier: 5,
    maxTier: 7,
    matchKeywords: ['stripe', 'payment', 'billing', 'subscription'],
  },
  {
    id: 'api-resend',
    category: 'api',
    name: 'Resend',
    description: 'Transactional email with React email templates.',
    url: 'https://resend.com/docs',
    projectTypes: ['website', 'web-app', 'saas', 'platform'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['email', 'resend', 'mail', 'transactional'],
  },
  {
    id: 'api-supabase',
    category: 'api',
    name: 'Supabase',
    description: 'Auth, Postgres, storage, and realtime in one hosted stack.',
    url: 'https://supabase.com/docs',
    projectTypes: ['web-app', 'saas', 'platform', 'prototype'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['supabase', 'postgres', 'auth', 'backend'],
  },
  {
    id: 'api-mapbox',
    category: 'api',
    name: 'Mapbox',
    description: 'Maps, geocoding, and navigation visuals.',
    url: 'https://docs.mapbox.com',
    projectTypes: ['web-app', 'saas', 'ios-mac-app'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['map', 'geo', 'location', 'mapbox'],
  },
  {
    id: 'api-twilio',
    category: 'api',
    name: 'Twilio',
    description: 'SMS, voice, and verify for user flows.',
    url: 'https://www.twilio.com/docs',
    projectTypes: ['saas', 'platform'],
    minTier: 5,
    maxTier: 7,
    matchKeywords: ['sms', 'twilio', 'phone', 'verify', '2fa'],
  },
  {
    id: 'api-cloudflare',
    category: 'api',
    name: 'Cloudflare',
    description: 'Workers, R2, KV, and edge for global apps.',
    url: 'https://developers.cloudflare.com',
    projectTypes: ['website', 'web-app', 'saas', 'platform'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['cloudflare', 'worker', 'edge', 'cdn'],
  },

  // ── Libraries (npm / packages for integrations) ───────────────
  {
    id: 'intlib-axios',
    category: 'library',
    name: 'axios',
    description: 'HTTP client for REST and third-party APIs.',
    url: 'https://axios-http.com',
    projectTypes: ['prototype', 'website', 'web-app', 'saas', 'platform', 'plugin-extension'],
    minTier: 3,
    maxTier: 7,
  },
  {
    id: 'intlib-zod',
    category: 'library',
    name: 'zod',
    description: 'Schema validation for API payloads and env config.',
    url: 'https://zod.dev',
    projectTypes: [],
    minTier: 3,
    maxTier: 7,
    matchKeywords: ['validation', 'schema', 'api'],
  },
  {
    id: 'intlib-stripe-node',
    category: 'library',
    name: 'stripe (Node)',
    description: 'Official Stripe server SDK for webhooks and charges.',
    url: 'https://github.com/stripe/stripe-node',
    projectTypes: ['saas', 'platform'],
    minTier: 5,
    maxTier: 7,
    matchKeywords: ['stripe', 'payment'],
  },
  {
    id: 'intlib-openai-node',
    category: 'library',
    name: 'openai (Node)',
    description: 'Official OpenAI SDK for Node/TS backends.',
    url: 'https://github.com/openai/openai-node',
    projectTypes: ['web-app', 'saas', 'platform'],
    minTier: 4,
    maxTier: 7,
    matchKeywords: ['openai', 'gpt'],
  },
  {
    id: 'intlib-alamofire',
    category: 'library',
    name: 'Alamofire',
    description: 'Elegant HTTP networking for Swift / iOS.',
    url: 'https://github.com/Alamofire/Alamofire',
    projectTypes: ['ios-mac-app'],
    minTier: 5,
    maxTier: 7,
  },
  {
    id: 'intlib-swift-openapi',
    category: 'library',
    name: 'Swift OpenAPI Generator',
    description: 'Generate Swift clients from OpenAPI specs.',
    url: 'https://github.com/apple/swift-openapi-generator',
    projectTypes: ['ios-mac-app'],
    minTier: 5,
    maxTier: 7,
    matchKeywords: ['openapi', 'rest', 'api'],
  },
];

export function getVisibleIntegrations(
  projectTypeId: string,
  tier: Tier,
  projectDescription: string,
): IntegrationItem[] {
  const desc = projectDescription.trim().toLowerCase();

  return integrationCatalog.filter((item) => {
    if (tier < item.minTier || tier > item.maxTier) return false;

    const typeOk =
      item.projectTypes.length === 0 || item.projectTypes.includes(projectTypeId);

    const kws = item.matchKeywords ?? [];
    if (kws.length > 0 && desc.length > 0) {
      const keywordOk = kws.some((k) => desc.includes(k.toLowerCase()));
      return typeOk || keywordOk;
    }

    return typeOk;
  });
}

export function getIntegrationById(id: string): IntegrationItem | undefined {
  return integrationCatalog.find((i) => i.id === id);
}
