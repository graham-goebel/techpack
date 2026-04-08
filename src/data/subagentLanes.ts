/**
 * Lanes for routing work to different models (subagents / focused sessions).
 * Maps to complexity domains—not 1:1 with stack layers, but aligned for prompt scoping.
 */
export const SUBAGENT_LANES: {
  id: string;
  label: string;
  /** Short hint for the sidebar and generated prompt */
  hint: string;
}[] = [
  {
    id: 'ui',
    label: 'UI & visual',
    hint: 'Components, CSS, layout, a11y, design polish',
  },
  {
    id: 'client',
    label: 'Client / frontend',
    hint: 'Routing, state, browser APIs, forms, interactivity',
  },
  {
    id: 'backend',
    label: 'Backend & APIs',
    hint: 'Server logic, auth, security, integrations',
  },
  {
    id: 'data',
    label: 'Data & services',
    hint: 'Database, storage, payments, messaging',
  },
  {
    id: 'platform',
    label: 'Platform & ops',
    hint: 'Hosting, CI/CD, observability, compliance',
  },
];
