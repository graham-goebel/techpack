import { SUBAGENT_LANES } from './subagentLanes';

/**
 * Maps each architecture block to the subagent lane whose prompts overlap this area.
 * Blocks not listed have no per-block subagent control (still covered by global prompt section).
 */
export const BLOCK_SUBAGENT_LANE_ID: Record<string, string> = {
  'visual-ui': 'ui',
  'markup-structure': 'ui',
  accessibility: 'ui',
  'seo-performance': 'ui',
  functionality: 'client',
  routing: 'client',
  'state-management': 'client',
  'backend-api': 'backend',
  auth: 'backend',
  security: 'backend',
  database: 'data',
  'file-storage': 'data',
  payments: 'data',
  'email-notifications': 'data',
  'env-secrets': 'platform',
  hosting: 'platform',
  'ci-cd': 'platform',
  analytics: 'platform',
  testing: 'platform',
  documentation: 'platform',
  compliance: 'platform',
};

export type SubagentLane = (typeof SUBAGENT_LANES)[number];

export function getSubagentLaneForBlock(blockId: string): SubagentLane | undefined {
  const laneId = BLOCK_SUBAGENT_LANE_ID[blockId];
  if (!laneId) return undefined;
  return SUBAGENT_LANES.find((l) => l.id === laneId);
}
