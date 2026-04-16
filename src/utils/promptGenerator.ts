import type { ProjectConfig, ProjectFileResource, Tier } from '../types';
import { projectTypes } from '../data/projectTypes';
import {
  getTypeDetailFields,
  type TypeDetailField,
} from '../data/projectTypeDetailFields';
import { blocks } from '../data/blocks';
import { techOptions } from '../data/techOptions';
import { blockLibraries } from '../data/libraries';
import { modelRecommendations, toolRecommendations } from '../data/models';
import { SUBAGENT_LANES } from '../data/subagentLanes';
import { getIntegrationById } from '../data/integrations';

const MAX_EMBED_FILE_CHARS = 10_000;

function decodeDataUrlToText(dataUrl: string): string | null {
  if (!dataUrl.startsWith('data:')) return null;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const header = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  if (/;base64/i.test(header)) {
    try {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch {
      return null;
    }
  }
  try {
    return decodeURIComponent(payload.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

function tryEmbedFileContent(r: ProjectFileResource): string | null {
  const mime = (r.mimeType || '').toLowerCase();
  const name = r.fileName.toLowerCase();
  const textLike =
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/xml' ||
    name.endsWith('.md') ||
    name.endsWith('.txt') ||
    name.endsWith('.json') ||
    name.endsWith('.csv');
  if (!textLike) return null;
  const text = decodeDataUrlToText(r.dataUrl);
  if (!text?.trim()) return null;
  if (text.length > MAX_EMBED_FILE_CHARS) {
    return `${text.slice(0, MAX_EMBED_FILE_CHARS)}\n\n…(truncated for prompt size)`;
  }
  return text;
}

function pushModelToolsAndSubagentSections(
  sections: string[],
  config: ProjectConfig,
  tierModels: (typeof modelRecommendations)[number][],
  tierTools: (typeof toolRecommendations)[number][],
): void {
  const chosenModel = config.selectedModelId
    ? modelRecommendations.find((m) => m.id === config.selectedModelId)
    : tierModels[0];
  const chosenTools =
    config.selectedToolIds.length > 0
      ? toolRecommendations.filter((t) => config.selectedToolIds.includes(t.id))
      : tierTools.slice(0, 1);

  sections.push('## AI Model & Tools');
  sections.push('');
  if (chosenModel) {
    sections.push(
      `**Model:** ${chosenModel.name} (${chosenModel.provider}) — ${chosenModel.reasoning}`,
    );
    sections.push('');
  }
  if (chosenTools.length > 0) {
    sections.push('**Tools:**');
    for (const tool of chosenTools) {
      sections.push(`- **${tool.name}**: ${tool.reasoning}`);
    }
  }

  if (config.useSubagents) {
    sections.push('');
    sections.push('## Subagent & model routing');
    sections.push('');
    sections.push(
      'Split work across **focused sessions** (separate chats, agent tasks, or subagents). Give each session only the slice of this brief that matches the lane below so prompts stay small and models are used efficiently. Model overrides are chosen in the sidebar under **Blocks** (expand a block — each block maps to a lane; overrides are shared across blocks in the same lane).',
    );
    sections.push('');
    const sub = config.subagentModels ?? {};
    for (const lane of SUBAGENT_LANES) {
      const overrideId = sub[lane.id];
      const override = overrideId
        ? modelRecommendations.find((m) => m.id === overrideId)
        : undefined;
      const effective = override ?? chosenModel;
      if (effective) {
        const tag = override ? 'dedicated model' : 'same as primary';
        sections.push(
          `- **${lane.label}** (${tag}): **${effective.name}** (${effective.provider}) — ${lane.hint}. ${effective.reasoning}`,
        );
      } else {
        sections.push(`- **${lane.label}**: ${lane.hint} — use your primary model.`);
      }
    }
    sections.push('');
    sections.push(
      '**Workflow:** For UI-only tasks, open a session with the UI lane model and paste only component/style requirements. For API or schema work, use the backend or data lane model with a trimmed prompt. Escalate to a stronger model when a task spans multiple lanes or needs deep reasoning.',
    );
  } else {
    sections.push('');
    sections.push(
      '**Subagents:** Off — use a single primary model for all work in this brief. Lane-specific overrides are disabled.',
    );
  }

  sections.push('');
}

export function generatePrompt(config: ProjectConfig, tier: Tier): string {
  const projectType = projectTypes.find((t) => t.id === config.projectTypeId);
  if (!projectType) return '';

  const selectedBlocks = blocks.filter((b) => config.selectedBlockIds.includes(b.id));
  const models = modelRecommendations.filter((m) => m.tiers.includes(tier));
  const tools = toolRecommendations
    .filter((t) => t.tiers.includes(tier))
    .sort((a, b) => {
      if (a.id === 'cursor') return -1;
      if (b.id === 'cursor') return 1;
      return 0;
    });

  const sections: string[] = [];

  // Header
  sections.push(`# Project: ${config.name || 'Untitled Project'}`);
  sections.push(`## Type: ${projectType.name}`);
  sections.push('');

  sections.push('## Getting Started');
  sections.push('');
  sections.push(generateGettingStarted(tier, selectedBlocks, config));
  sections.push('');

  if (config.buildAsYouGo) {
    sections.push('## Workflow');
    sections.push('');
    sections.push(
      '**Build as you go:** Prioritize clarifying the product concept and user outcomes. Treat stack choices in this brief as guidance, not hard requirements — propose alternatives, challenge assumptions, and refine technology as understanding improves.',
    );
    sections.push('');
  }

  if (config.preferOpenSourceOnly) {
    sections.push('## Stack preferences');
    sections.push('');
    sections.push(
      '**Free / open source:** Prefer dependencies, tools, and deployment paths that are **open source** (OSI-approved or widely accepted OSS licenses) and/or **free to use** for this project’s scale. When a proprietary or paid service is materially better, note the tradeoff and suggest an OSS alternative if one exists. Avoid unnecessary vendor lock-in.',
    );
    sections.push('');
  }

  pushModelToolsAndSubagentSections(sections, config, models, tools);

  // Description
  if (config.projectDescription) {
    sections.push('## Project Description');
    sections.push(config.projectDescription);
    sections.push('');
  }

  const typeDetails = config.typeDetails ?? {};
  const detailFields = getTypeDetailFields(config.projectTypeId);
  const filledDetails = detailFields.filter((f) => {
    const v = (typeDetails[f.id] ?? '').trim();
    return v.length > 0;
  });
  if (filledDetails.length > 0) {
    sections.push('## Project specifics');
    sections.push('');
    for (const field of filledDetails) {
      const raw = (typeDetails[field.id] ?? '').trim();
      sections.push(`- **${field.label}**: ${formatTypeDetailValue(field, raw)}`);
    }
    sections.push('');
  }

  const resources = config.resources ?? [];
  if (resources.length > 0) {
    sections.push('## Resources & references');
    sections.push('');
    sections.push(
      'The following links and files are part of this workspace. Use them as documentation or context where relevant.',
    );
    sections.push('');
    for (const r of resources) {
      if (r.kind === 'url') {
        sections.push(`- **${r.label}**: ${r.url}`);
      } else {
        sections.push(
          `- **File**: ${r.fileName} (${r.mimeType || 'unknown type'}, ${r.sizeBytes} bytes)`,
        );
        const embedded = tryEmbedFileContent(r);
        if (embedded) {
          sections.push('');
          sections.push('```');
          sections.push(embedded);
          sections.push('```');
        }
      }
    }
    sections.push('');
  }

  // Tech Stack Overview
  sections.push('## Tech Stack Overview');
  sections.push('');
  const stackLines: string[] = [];
  for (const block of selectedBlocks) {
    const chosenOptionId = config.techChoices[block.id];
    if (chosenOptionId) {
      const option = techOptions.find((o) => o.id === chosenOptionId);
      if (option) {
        stackLines.push(`- **${block.name}**: ${option.name} — ${option.description}`);
      }
    } else {
      stackLines.push(`- **${block.name}**: (standard implementation)`);
    }
    const blockLibs = blockLibraries.filter(
      (l) => l.blockId === block.id && config.selectedLibraryIds.includes(l.id),
    );
    if (blockLibs.length > 0) {
      const grouped = blockLibs.reduce<Record<string, string[]>>((acc, l) => {
        (acc[l.category] ??= []).push(l.name);
        return acc;
      }, {});
      for (const [cat, names] of Object.entries(grouped)) {
        stackLines.push(`  - *${cat}*: ${names.join(', ')}`);
      }
    }
  }
  sections.push(stackLines.join('\n'));
  sections.push('');

  // Architecture
  sections.push('## Architecture Overview');
  sections.push('');
  sections.push(generateArchitectureDescription(projectType.id, selectedBlocks, config));
  sections.push('');

  // Requirements by block
  sections.push('## Requirements by Block');
  sections.push('');
  for (const block of selectedBlocks) {
    sections.push(`### ${block.name}`);
    sections.push('');
    sections.push(generateBlockRequirements(block.id, config, tier));
    sections.push('');
  }

  // File structure
  sections.push('## Suggested File Structure');
  sections.push('');
  sections.push('```');
  sections.push(generateFileStructure(tier, config));
  sections.push('```');
  sections.push('');

  const chosenIntegrations = (config.selectedIntegrationIds ?? [])
    .map((id) => getIntegrationById(id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  if (chosenIntegrations.length > 0) {
    sections.push('');
    sections.push('## Integrations & dependencies');
    sections.push('');
    const byCat = chosenIntegrations.reduce<Record<string, typeof chosenIntegrations>>((acc, i) => {
      (acc[i.category] ??= []).push(i);
      return acc;
    }, {});
    const order = ['skill', 'mcp', 'api', 'library'] as const;
    const labels: Record<(typeof order)[number], string> = {
      skill: 'Skills (skills.sh & related)',
      mcp: 'MCP servers',
      api: 'Third-party APIs',
      library: 'Integration libraries',
    };
    for (const cat of order) {
      const list = byCat[cat];
      if (!list?.length) continue;
      sections.push(`**${labels[cat]}:**`);
      for (const i of list) {
        const link = i.skillsShPath
          ? `https://skills.sh/${i.skillsShPath.replace(/^\//, '')}`
          : i.url;
        const extra = link ? ` — ${link}` : '';
        const hint = i.installHint ? ` (${i.installHint})` : '';
        sections.push(`- **${i.name}**: ${i.description}${extra}${hint}`);
      }
      sections.push('');
    }
  }

  return sections.join('\n');
}

function formatTypeDetailValue(field: TypeDetailField, value: string): string {
  if ((field.input === 'select' || field.input === 'chips') && field.options) {
    const opt = field.options.find((o) => o.value === value);
    if (opt?.value) return opt.label;
  }
  return value;
}

function generateArchitectureDescription(
  typeId: string,
  selectedBlocks: typeof blocks,
  config: ProjectConfig,
): string {
  const hasBackend = selectedBlocks.some((b) => b.id === 'backend-api');
  const hasDb = selectedBlocks.some((b) => b.id === 'database');
  const hasAuth = selectedBlocks.some((b) => b.id === 'auth');
  const hasPayments = selectedBlocks.some((b) => b.id === 'payments');
  const hasStorage = selectedBlocks.some((b) => b.id === 'file-storage');

  const uiChoice = config.techChoices['visual-ui'];
  const fwChoice = config.techChoices['functionality'];
  const dbChoice = config.techChoices['database'];
  const authChoice = config.techChoices['auth'];

  const uiName = techOptions.find((o) => o.id === uiChoice)?.name ?? 'CSS';
  const fwName = techOptions.find((o) => o.id === fwChoice)?.name ?? 'vanilla JavaScript';
  const dbName = techOptions.find((o) => o.id === dbChoice)?.name;
  const authName = techOptions.find((o) => o.id === authChoice)?.name;

  if (typeId === 'markdown') {
    return `This is a structured markdown document — a skill, rule, hook, workflow, or similar text-based deliverable. No build step, no UI framework. The output is one or more well-organized .md files with clear sections, consistent formatting, and any required frontmatter or metadata. Focus on clarity, completeness, and following the target tool's conventions.`;
  }

  if (typeId === 'mood-board') {
    return `This is a static mood board built with ${uiName}. No JavaScript framework or build step is needed — just HTML and CSS files that can be opened directly in a browser or deployed as a static site. Focus on design tokens (colors, typography, spacing) and example component patterns.`;
  }

  if (typeId === 'plugin-extension') {
    return `This is a plugin/extension that runs within an existing platform's environment. The UI layer uses ${uiName} and the logic is written in ${fwName}. Follow the host platform's API conventions and manifest requirements. The plugin should be self-contained and follow the host platform's lifecycle.`;
  }

  if (typeId === 'prototype') {
    return `This is an interactive prototype built with ${fwName} and styled with ${uiName}. It's designed to demonstrate a concept, not to be production-ready. Focus on the core interaction flow and visual polish. ${hasBackend ? 'It connects to a lightweight backend for data.' : 'Use mock data where possible to keep things simple.'}`;
  }

  if (typeId === 'ios-mac-app') {
    const parts: string[] = [];
    parts.push(`This is a native Apple platform application built with Swift and SwiftUI/UIKit.`);
    parts.push(`Follow Apple's Human Interface Guidelines for layout, navigation, and interaction patterns.`);
    if (hasBackend) {
      const backendName = techOptions.find((o) => o.id === config.techChoices['backend-api'])?.name ?? 'a backend API';
      parts.push(`The app communicates with ${backendName} for server-side operations.`);
    }
    if (hasDb && dbName) {
      parts.push(`Remote data is stored in ${dbName}.`);
    }
    if (hasAuth && authName) {
      parts.push(`User authentication is handled by ${authName}.`);
    }
    return parts.join(' ');
  }

  const parts: string[] = [];
  parts.push(`This is a ${typeId === 'website' ? 'multi-page website' : typeId === 'web-app' ? 'dynamic web application' : typeId === 'saas' ? 'SaaS application' : 'multi-service platform'} built with ${fwName} and styled with ${uiName}.`);

  if (hasDb && dbName) {
    parts.push(`Data is stored in ${dbName}.`);
  }
  if (hasAuth && authName) {
    parts.push(`User authentication is handled by ${authName}.`);
  }
  if (hasPayments) {
    const paymentName = techOptions.find((o) => o.id === config.techChoices['payments'])?.name ?? 'a payment processor';
    parts.push(`Payments are processed through ${paymentName}.`);
  }
  if (hasStorage) {
    const storageName = techOptions.find((o) => o.id === config.techChoices['file-storage'])?.name ?? 'cloud storage';
    parts.push(`File uploads are managed with ${storageName}.`);
  }
  if (hasBackend) {
    const backendName = techOptions.find((o) => o.id === config.techChoices['backend-api'])?.name ?? 'a backend API';
    parts.push(`The backend runs on ${backendName}.`);
  }

  return parts.join(' ');
}

function generateBlockRequirements(
  blockId: string,
  config: ProjectConfig,
  tier: Tier,
): string {
  const chosenOptionId = config.techChoices[blockId];
  const chosenOption = techOptions.find((o) => o.id === chosenOptionId);
  const lines: string[] = [];

  const reqs: Record<string, string[]> = {
    'visual-ui': [
      'Define a design token system: colors (primary, secondary, neutral, semantic), typography scale (6-8 sizes), spacing scale (4px base), border radii, and shadows.',
      'Create a component library with at minimum: Button (primary, secondary, ghost variants), Input, Card, Badge, and Modal.',
      'Implement responsive design with mobile-first breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).',
      'Use a consistent color system with light and dark mode support.',
      'Ensure all interactive elements have visible focus states for keyboard navigation.',
    ],
    'markup-structure': [
      'Use semantic HTML5 elements: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>.',
      'Ensure all images have descriptive alt text.',
      'Use heading hierarchy correctly (h1 → h2 → h3, no skipping levels).',
      'Add ARIA labels to interactive elements that lack visible text.',
      'Structure forms with proper <label> elements and fieldsets.',
    ],
    accessibility: [
      'Meet WCAG 2.1 Level AA compliance for all pages and interactive components.',
      'Maintain minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold), and 3:1 for UI components and graphical objects.',
      'Ensure full keyboard navigability: all interactive elements reachable via Tab, operable via Enter/Space, dismissible via Escape, and have visible focus indicators.',
      'Add meaningful ARIA attributes: aria-label for icon-only buttons, aria-live regions for dynamic content, aria-expanded for collapsibles, and role attributes where semantic HTML is insufficient.',
      'Support screen readers: test with VoiceOver (macOS) or NVDA (Windows) to verify reading order, announcements, and landmark navigation.',
      'Respect prefers-reduced-motion and prefers-color-scheme media queries — disable animations and provide appropriate color schemes for users who request them.',
      'Implement skip-to-content links and logical focus management for route changes and modal dialogs.',
      'Run automated accessibility audits (axe-core or Pa11y) in CI to catch regressions on every pull request.',
    ],
    functionality: [
      'Implement error boundaries and graceful error handling.',
      'Use TypeScript for type safety across the entire codebase.',
      'Follow component composition patterns — keep components small and focused.',
      'Handle loading states for all async operations.',
      'Implement proper cleanup in useEffect hooks to prevent memory leaks.',
    ],
    routing: [
      'Implement client-side routing with URL-based navigation.',
      'Add a 404 / not-found page for unmatched routes.',
      'Implement route-based code splitting for better load performance.',
      'Handle protected routes that require authentication (redirect to login).',
      'Support deep linking — every meaningful view should have a shareable URL.',
    ],
    'state-management': [
      'Separate UI state (modals, dropdowns) from domain state (user data, entities).',
      'Implement optimistic updates for better perceived performance.',
      'Use derived/computed state instead of storing redundant data.',
      'Keep state as close to where it\'s used as possible — lift only when necessary.',
      'Handle stale data with appropriate cache invalidation strategies.',
    ],
    'backend-api': [
      'Design RESTful API endpoints with consistent naming conventions.',
      'Return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).',
      'Validate all incoming request data on the server side.',
      'Implement proper error responses with human-readable messages.',
      'Add request logging for debugging and monitoring.',
    ],
    database: [
      'Design a normalized database schema with proper relationships.',
      'Add indexes on frequently queried columns.',
      'Implement database migrations for schema changes.',
      'Use row-level security (RLS) policies if using Supabase/PostgreSQL.',
      'Set up proper foreign key constraints and cascading rules.',
      'Plan for soft deletes where data retention is important.',
    ],
    auth: [
      'Implement email/password authentication at minimum.',
      'Add OAuth social login (Google, GitHub) for convenience.',
      'Implement proper session management with secure, httpOnly cookies.',
      'Add password reset / forgot password flow.',
      'Implement role-based access control (RBAC) — at minimum: user and admin roles.',
      'Protect all sensitive API routes with authentication middleware.',
    ],
    security: [
      'Enable HTTPS everywhere — never serve content over HTTP.',
      'Implement CORS policies to restrict which domains can call your API.',
      'Sanitize and validate all user input on both client and server.',
      'Set security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options.',
      'Implement rate limiting on authentication endpoints.',
      'Never log sensitive data (passwords, tokens, PII).',
    ],
    'file-storage': [
      'Validate file types and sizes before upload.',
      'Generate unique filenames to prevent collisions.',
      'Implement access control — users should only access their own files.',
      'Set up image optimization and responsive image serving.',
      'Add virus/malware scanning for user-uploaded files in production.',
    ],
    payments: [
      'Never handle raw credit card data — use the payment processor\'s hosted checkout or Elements.',
      'Implement webhook handlers for payment events (successful payment, subscription canceled, etc.).',
      'Store subscription status in your database, synced via webhooks.',
      'Handle failed payments and dunning (retry logic).',
      'Set up pricing tiers and plan management.',
      'Implement a billing portal for users to manage their subscription.',
    ],
    'email-notifications': [
      'Set up transactional email for: welcome, password reset, and key notifications.',
      'Use a templating system for consistent email design.',
      'Implement proper email authentication (SPF, DKIM, DMARC) for deliverability.',
      'Add unsubscribe links to all marketing-style emails.',
      'Queue emails to handle failures and retries gracefully.',
    ],
    'env-secrets': [
      'Create a .env.example file with all required variables (without values) for onboarding.',
      'Add .env to .gitignore — never commit secrets to version control.',
      'Use different environment variables for development, staging, and production.',
      'Validate that required environment variables are set at startup.',
      'Document what each environment variable does and where to get its value.',
    ],
    hosting: [
      'Set up automatic deployments from the main branch.',
      'Configure preview deployments for pull requests.',
      'Set up a custom domain with SSL certificate.',
      'Configure CDN caching for static assets.',
      'Set up environment variables in the hosting platform.',
    ],
    'ci-cd': [
      'Run linting and type checking on every pull request.',
      'Run tests automatically before allowing merge.',
      'Set up automated deployments: main branch → production, PRs → preview.',
      'Add branch protection rules to prevent direct pushes to main.',
      'Keep CI pipelines fast — target under 5 minutes.',
    ],
    analytics: [
      'Track page views and core user actions (sign up, key feature usage, conversion events).',
      'Implement error tracking with stack traces and user context.',
      'Set up performance monitoring for page load times and API latency.',
      'Ensure analytics respects user privacy and consent preferences.',
      'Create a dashboard for key metrics (DAU, conversion rate, error rate).',
    ],
    'seo-performance': [
      'Add unique title and meta description to every page.',
      'Implement Open Graph meta tags for social media sharing.',
      'Generate a sitemap.xml and robots.txt.',
      'Optimize images: use WebP/AVIF formats, add width/height attributes, lazy load below the fold.',
      'Target Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1.',
      'Implement proper canonical URLs to avoid duplicate content.',
    ],
    testing: [
      'Write unit tests for all business logic and utility functions.',
      'Write integration tests for API endpoints.',
      'Add E2E tests for critical user flows (sign up, core feature, checkout).',
      'Maintain test coverage above 70% for business-critical code.',
      'Use factories/fixtures for test data, not hardcoded values.',
    ],
    documentation: [
      'Write a comprehensive README with: project overview, setup instructions, environment variables, and architecture notes.',
      'Document all API endpoints with request/response examples.',
      'Add inline code comments only for complex business logic.',
      'Document architecture decisions in ADR (Architecture Decision Record) format.',
      'Include a CONTRIBUTING.md if the project accepts contributions.',
    ],
    compliance: [
      'Create a Privacy Policy that describes data collection and usage.',
      'Create Terms of Service for user agreements.',
      'Implement cookie consent banner for EU visitors.',
      'Add a data export feature (GDPR right to data portability).',
      'Add a data deletion feature (GDPR right to erasure).',
      'Log data processing activities for compliance audits.',
    ],
  };

  const blockReqs = reqs[blockId] ?? [];
  const applicableReqs = filterRequirementsByTier(blockReqs, tier);

  if (chosenOption) {
    lines.push(`**Technology:** ${chosenOption.name}`);
    lines.push('');
  }

  lines.push('**Requirements:**');
  for (const req of applicableReqs) {
    lines.push(`- ${req}`);
  }

  return lines.join('\n');
}

function filterRequirementsByTier(reqs: string[], tier: Tier): string[] {
  if (tier <= 2) return reqs.slice(0, 3);
  if (tier <= 4) return reqs.slice(0, 4);
  return reqs;
}

function generateFileStructure(tier: Tier, config: ProjectConfig): string {
  const hasBackend = config.selectedBlockIds.includes('backend-api');
  const hasDb = config.selectedBlockIds.includes('database');
  const hasAuth = config.selectedBlockIds.includes('auth');
  const hasTests = config.selectedBlockIds.includes('testing');

  if (config.projectTypeId === 'markdown') {
    return `project/
├── SKILL.md (or RULE.md)    # Primary deliverable
├── examples/                 # Usage examples
│   ├── example-1.md
│   └── example-2.md
├── templates/                # Reusable templates
│   └── template.md
└── README.md                 # Setup and usage guide`;
  }

  if (config.projectTypeId === 'ios-mac-app') {
    const lines = [
      'App/',
      '├── App.swift                # App entry point',
      '├── ContentView.swift        # Root view',
      '├── Views/',
      '│   ├── Components/          # Reusable UI components',
      '│   └── Screens/             # Top-level screen views',
      '├── Models/                   # Data models',
      '├── ViewModels/               # View models / observable objects',
      '├── Services/',
    ];
    if (hasBackend) {
      lines.push('│   ├── APIClient.swift       # Network layer');
    }
    if (hasAuth) {
      lines.push('│   ├── AuthService.swift     # Authentication');
    }
    lines.push('│   └── ...');
    lines.push('├── Utilities/                # Extensions and helpers');
    lines.push('├── Resources/');
    lines.push('│   ├── Assets.xcassets       # Images, colors, app icon');
    lines.push('│   └── Localizable.strings   # Localization');
    if (hasTests) {
      lines.push('├── Tests/');
      lines.push('│   ├── UnitTests/');
      lines.push('│   └── UITests/');
    }
    lines.push('├── Info.plist');
    lines.push('└── README.md');
    return lines.join('\n');
  }

  if (tier <= 1) {
    return `project/
├── index.html
├── styles/
│   ├── tokens.css          # Design tokens (colors, typography, spacing)
│   ├── components.css      # Component styles
│   └── layout.css          # Page layout
├── assets/
│   └── images/
└── README.md`;
  }

  if (tier <= 2) {
    return `project/
├── src/
│   ├── main.ts             # Entry point
│   ├── ui.ts               # UI creation and updates
│   └── utils.ts            # Helper functions
├── manifest.json            # Plugin/extension manifest
├── package.json
└── README.md`;
  }

  if (tier <= 3) {
    return `project/
├── src/
│   ├── components/         # Reusable UI components
│   ├── styles/             # CSS / design tokens
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                  # Static assets
├── .env.example
├── package.json
└── README.md`;
  }

  if (tier <= 4) {
    return `project/
├── src/
│   ├── components/
│   │   ├── ui/             # Shared UI components
│   │   └── layout/         # Header, Footer, Navigation
│   ├── pages/              # Page components (one per route)
│   ├── styles/             # Global styles and tokens
│   ├── utils/              # Helper functions
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx
│   └── main.tsx
├── public/                  # Static assets, favicon, robots.txt
├── .env.example
├── package.json
└── README.md`;
  }

  const lines = [
    'project/',
    '├── src/',
    '│   ├── components/',
    '│   │   ├── ui/             # Shared UI components (Button, Card, Modal)',
    '│   │   ├── layout/         # Shell, Header, Sidebar, Footer',
    '│   │   └── features/       # Feature-specific components',
    '│   ├── pages/              # Page/route components',
    '│   ├── hooks/              # Custom React hooks',
    '│   ├── utils/              # Helper functions and utilities',
    '│   ├── types/              # TypeScript type definitions',
  ];

  if (hasDb) {
    lines.push('│   ├── lib/');
    lines.push('│   │   ├── db.ts            # Database client and helpers');
    if (hasAuth) {
      lines.push('│   │   └── auth.ts          # Auth client and helpers');
    }
  }

  if (hasBackend) {
    lines.push('│   ├── api/                 # API route handlers');
  }

  lines.push('│   ├── styles/              # Global styles and tokens');
  lines.push('│   ├── App.tsx');
  lines.push('│   └── main.tsx');

  if (hasTests) {
    lines.push('├── tests/');
    lines.push('│   ├── unit/               # Unit tests');
    lines.push('│   ├── integration/        # Integration tests');
    lines.push('│   └── e2e/                # End-to-end tests');
  }

  if (hasDb) {
    lines.push('├── supabase/');
    lines.push('│   └── migrations/         # Database migrations');
  }

  lines.push('├── public/                  # Static assets');
  lines.push('├── .env.example');
  lines.push('├── package.json');
  lines.push('├── tsconfig.json');
  lines.push('└── README.md');

  return lines.join('\n');
}

function generateGettingStarted(
  tier: Tier,
  selectedBlocks: typeof blocks,
  config: ProjectConfig,
): string {
  const steps: string[] = [];

  steps.push('**Implementation order** (build in this sequence):');
  steps.push('');

  if (config.projectTypeId === 'markdown') {
    steps.push('1. Define the document schema — required sections, frontmatter keys, naming conventions');
    steps.push('2. Write the primary deliverable with all required sections');
    steps.push('3. Add usage examples demonstrating real-world application');
    steps.push('4. Create templates for reuse if applicable');
    steps.push('5. Write a README explaining setup, usage, and conventions');
    return steps.join('\n');
  }

  if (config.projectTypeId === 'ios-mac-app') {
    steps.push('1. Create the Xcode project with the correct target platforms');
    steps.push('2. Set up the navigation structure and root views');
    steps.push('3. Define data models and view models');
    if (selectedBlocks.some((b) => b.id === 'backend-api')) {
      steps.push('4. Build the networking layer and API client');
    }
    if (selectedBlocks.some((b) => b.id === 'auth')) {
      steps.push('5. Implement authentication flow');
    }
    steps.push('6. Build core feature screens with real data');
    steps.push('7. Add error handling, loading states, and empty states');
    if (selectedBlocks.some((b) => b.id === 'testing')) {
      steps.push('8. Write unit tests and UI tests for critical paths');
    }
    steps.push('9. Configure App Store Connect and submit for review');
    return steps.join('\n');
  }

  if (tier <= 2) {
    steps.push('1. Set up the project structure and basic HTML');
    steps.push('2. Implement the design tokens and visual language');
    steps.push('3. Build out the component styles and examples');
    if (tier === 2) {
      steps.push('4. Add interactivity and plugin logic');
      steps.push('5. Test within the host platform');
    }
  } else if (tier <= 4) {
    steps.push('1. Scaffold the project with Vite and install dependencies');
    steps.push('2. Set up the design system (tokens, global styles, base components)');
    steps.push('3. Build the page layout (header, footer, navigation)');
    steps.push('4. Create individual pages and connect routing');
    steps.push('5. Add interactivity and dynamic features');
    if (selectedBlocks.some((b) => b.id === 'seo-performance')) {
      steps.push('6. Implement SEO meta tags and performance optimizations');
    }
    steps.push(`${selectedBlocks.some((b) => b.id === 'seo-performance') ? '7' : '6'}. Deploy to hosting platform`);
  } else {
    steps.push('1. Scaffold the project and install core dependencies');
    steps.push('2. Set up the design system and shared UI components');
    if (selectedBlocks.some((b) => b.id === 'database')) {
      steps.push('3. Set up the database schema and migrations');
    }
    if (selectedBlocks.some((b) => b.id === 'auth')) {
      steps.push('4. Implement authentication (sign up, login, session management)');
    }
    steps.push('5. Build the core feature pages and business logic');
    if (selectedBlocks.some((b) => b.id === 'backend-api')) {
      steps.push('6. Create API endpoints for data operations');
    }
    if (selectedBlocks.some((b) => b.id === 'payments')) {
      steps.push('7. Integrate payment processing');
    }
    steps.push('8. Add error handling, loading states, and edge cases');
    if (selectedBlocks.some((b) => b.id === 'testing')) {
      steps.push('9. Write tests for critical paths');
    }
    steps.push('10. Deploy and set up monitoring');
  }

  return steps.join('\n');
}

export function getRecommendedModels(tier: Tier) {
  return modelRecommendations.filter((m) => m.tiers.includes(tier));
}

export function getRecommendedTools(tier: Tier) {
  return toolRecommendations
    .filter((t) => t.tiers.includes(tier))
    .sort((a, b) => {
      if (a.id === 'cursor') return -1;
      if (b.id === 'cursor') return 1;
      return 0;
    });
}
