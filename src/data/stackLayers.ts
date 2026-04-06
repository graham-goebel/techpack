import type { Block } from '../types';

/**
 * Same layer grouping as the architecture map — single source of truth.
 */
export const STACK_LAYER_DEFS: { id: string; label: string; ids: string[] }[] = [
  { id: 'presentation', label: 'Presentation', ids: ['visual-ui', 'markup-structure', 'accessibility', 'seo-performance'] },
  { id: 'client', label: 'Client', ids: ['routing', 'functionality', 'state-management'] },
  { id: 'server', label: 'Server', ids: ['auth', 'backend-api', 'security'] },
  {
    id: 'data-services',
    label: 'Data & Services',
    ids: ['database', 'file-storage', 'payments', 'email-notifications'],
  },
  {
    id: 'operations',
    label: 'Operations',
    ids: ['env-secrets', 'hosting', 'ci-cd', 'analytics', 'testing', 'documentation', 'compliance'],
  },
];

const ASSIGNED_IDS = new Set(STACK_LAYER_DEFS.flatMap((d) => d.ids));

/**
 * Groups visible blocks by stack layer (map order). Unlisted blocks go under "Other".
 */
export function groupVisibleBlocksByStackLayer(visibleBlocks: Block[]): {
  layerId: string;
  label: string;
  blocks: Block[];
}[] {
  const visibleIds = new Set(visibleBlocks.map((b) => b.id));
  const blockMap = new Map(visibleBlocks.map((b) => [b.id, b]));

  const out: { layerId: string; label: string; blocks: Block[] }[] = [];
  for (const def of STACK_LAYER_DEFS) {
    const row = def.ids
      .filter((id) => visibleIds.has(id))
      .map((id) => blockMap.get(id)!)
      .filter(Boolean);
    if (row.length > 0) {
      out.push({ layerId: def.id, label: def.label, blocks: row });
    }
  }

  const extra = visibleBlocks.filter((b) => !ASSIGNED_IDS.has(b.id));
  if (extra.length > 0) {
    out.push({ layerId: 'other', label: 'Other', blocks: extra });
  }

  return out;
}
