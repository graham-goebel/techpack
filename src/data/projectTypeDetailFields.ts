/**
 * Extra detail fields shown in Project Details when a project type is selected.
 * Values are stored on ProjectConfig.typeDetails[field.id].
 */
export interface TypeDetailField {
  id: string;
  label: string;
  placeholder?: string;
  /** Default false */
  multiline?: boolean;
  rows?: number;
  /** `chips`: single-select pills (good for a few short options). `select`: native menu (long lists). */
  input?: 'text' | 'select' | 'chips';
  options?: { value: string; label: string }[];
}

const pluginPlatforms: { value: string; label: string }[] = [
  { value: 'figma', label: 'Figma' },
  { value: 'chrome', label: 'Chrome / Chromium extension' },
  { value: 'firefox', label: 'Firefox extension' },
  { value: 'safari', label: 'Safari extension' },
  { value: 'vscode', label: 'VS Code' },
  { value: 'jetbrains', label: 'JetBrains (IntelliJ, WebStorm, …)' },
  { value: 'after-effects', label: 'After Effects' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'notion', label: 'Notion' },
  { value: 'obsidian', label: 'Obsidian' },
  { value: 'slack', label: 'Slack' },
  { value: 'other', label: 'Other (say more in scope)' },
];

const typeDetailFieldsByProjectType: Record<string, TypeDetailField[]> = {
  markdown: [
    {
      id: 'document-type',
      label: 'Document type',
      input: 'chips',
      options: [
        { value: 'skill', label: 'Skill' },
        { value: 'rule', label: 'Rule' },
        { value: 'hook', label: 'Hook' },
        { value: 'workflow', label: 'Workflow' },
        { value: 'runbook', label: 'Runbook' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'target-tool',
      label: 'Target tool / platform',
      placeholder: 'e.g. Cursor, GitHub Actions, git hooks, Make',
    },
    {
      id: 'schema-conventions',
      label: 'Schema or conventions',
      placeholder: 'Required sections, frontmatter keys, naming rules…',
      multiline: true,
      rows: 3,
    },
  ],
  'mood-board': [
    {
      id: 'deliverable-focus',
      label: 'Deliverable focus',
      placeholder: 'e.g. dev handoff, stakeholder sign-off, design QA',
    },
    {
      id: 'brand-context',
      label: 'Brand / audience',
      placeholder: 'Who is this for? Any existing brand rules?',
      multiline: true,
      rows: 2,
    },
  ],
  'plugin-extension': [
    {
      id: 'host-platform',
      label: 'Host platform',
      input: 'select',
      options: [{ value: '', label: 'Select platform…' }, ...pluginPlatforms],
    },
    {
      id: 'extension-scope',
      label: 'What it does in the host',
      placeholder: 'Commands, panels, file hooks, background behavior…',
      multiline: true,
      rows: 3,
    },
    {
      id: 'distribution',
      label: 'Distribution',
      placeholder: 'e.g. public store, internal only, side-loaded',
    },
  ],
  prototype: [
    {
      id: 'hypothesis',
      label: 'What you are proving',
      placeholder: 'The risk or assumption this prototype tests',
      multiline: true,
      rows: 2,
    },
    {
      id: 'fidelity',
      label: 'Fidelity',
      input: 'chips',
      options: [
        { value: 'low', label: 'Low — flow & layout' },
        { value: 'mid', label: 'Mid — real UI, limited data' },
        { value: 'high', label: 'High — close to production feel' },
      ],
    },
    {
      id: 'demo-audience',
      label: 'Who will see the demo',
      placeholder: 'e.g. internal team, investors, pilot users',
    },
  ],
  website: [
    {
      id: 'site-kind',
      label: 'Site type',
      input: 'chips',
      options: [
        { value: 'marketing', label: 'Marketing' },
        { value: 'portfolio', label: 'Portfolio' },
        { value: 'blog', label: 'Blog' },
        { value: 'docs', label: 'Docs' },
        { value: 'landing', label: 'Landing' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'information-architecture',
      label: 'Main pages or sections',
      placeholder: 'Home, pricing, about, blog…',
      multiline: true,
      rows: 2,
    },
    {
      id: 'traffic-sources',
      label: 'Traffic / discovery',
      placeholder: 'e.g. SEO, ads, social, direct',
    },
  ],
  'web-app': [
    {
      id: 'primary-users',
      label: 'Primary users',
      placeholder: 'Roles and who logs in (if anyone)',
    },
    {
      id: 'critical-flows',
      label: 'Critical user flows',
      placeholder: 'The 2–3 jobs the app must nail first',
      multiline: true,
      rows: 3,
    },
    {
      id: 'data-sources',
      label: 'Data & integrations',
      placeholder: 'APIs, uploads, third-party services…',
      multiline: true,
      rows: 2,
    },
  ],
  saas: [
    {
      id: 'monetization',
      label: 'Monetization (intent)',
      input: 'chips',
      options: [
        { value: 'none', label: 'TBD / free' },
        { value: 'subscription', label: 'Subscription' },
        { value: 'usage', label: 'Usage' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'marketplace', label: 'Marketplace' },
      ],
    },
    {
      id: 'tenant-model',
      label: 'Tenancy',
      input: 'chips',
      options: [
        { value: 'single', label: 'Single org' },
        { value: 'multi', label: 'Multi-tenant' },
        { value: 'b2b2c', label: 'B2B2C' },
      ],
    },
    {
      id: 'compliance',
      label: 'Compliance / constraints',
      placeholder: 'e.g. GDPR, SOC2, HIPAA — or none yet',
      multiline: true,
      rows: 2,
    },
  ],
  'ios-mac-app': [
    {
      id: 'apple-platforms',
      label: 'Target platforms',
      input: 'chips',
      options: [
        { value: 'iphone', label: 'iPhone' },
        { value: 'ipad', label: 'iPad' },
        { value: 'mac', label: 'Mac' },
        { value: 'watch', label: 'Watch' },
        { value: 'vision', label: 'Vision' },
      ],
    },
    {
      id: 'ui-framework',
      label: 'UI framework',
      input: 'chips',
      options: [
        { value: 'swiftui', label: 'SwiftUI' },
        { value: 'uikit', label: 'UIKit' },
        { value: 'both', label: 'Both' },
      ],
    },
    {
      id: 'app-capabilities',
      label: 'Key capabilities',
      placeholder: 'e.g. networking, Core Data, HealthKit, camera, notifications',
      multiline: true,
      rows: 3,
    },
    {
      id: 'distribution',
      label: 'Distribution',
      input: 'chips',
      options: [
        { value: 'app-store', label: 'App Store' },
        { value: 'testflight', label: 'TestFlight' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'personal', label: 'Personal use' },
      ],
    },
  ],
  platform: [
    {
      id: 'product-surface',
      label: 'Product surfaces',
      placeholder: 'User apps, admin, API, workers, mobile…',
      multiline: true,
      rows: 3,
    },
    {
      id: 'service-boundaries',
      label: 'Service boundaries',
      placeholder: 'What is in vs out of scope for v1?',
      multiline: true,
      rows: 2,
    },
    {
      id: 'external-integrations',
      label: 'External systems',
      placeholder: 'Payments, email, identity, storage, webhooks…',
      multiline: true,
      rows: 2,
    },
  ],
};

export function getTypeDetailFields(projectTypeId: string): TypeDetailField[] {
  return typeDetailFieldsByProjectType[projectTypeId] ?? [];
}
