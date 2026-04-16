import type { IntegrationCategory } from './integrations';

/** Tint classes for category initial tiles (stack + sidebar integration rows). */
export const INTEGRATION_CAT_ICON: Record<IntegrationCategory, string> = {
  skill: 'bg-violet-100 text-violet-800',
  mcp: 'bg-blue-100 text-blue-800',
  api: 'bg-cyan-100 text-cyan-900',
  library: 'bg-amber-100 text-amber-900',
};
