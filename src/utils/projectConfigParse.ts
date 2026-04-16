import type { ProjectConfig, ProjectResource } from '../types';
import { projectTypes } from '../data/projectTypes';

const validProjectTypeIds = new Set(projectTypes.map((t) => t.id));

function parseResources(raw: unknown): ProjectResource[] {
  if (!Array.isArray(raw)) return [];
  const out: ProjectResource[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : '';
    if (!id) continue;
    if (o.kind === 'url') {
      const url = typeof o.url === 'string' ? o.url.trim() : '';
      if (!url) continue;
      const label = typeof o.label === 'string' ? o.label.trim() : url;
      out.push({ id, kind: 'url', label: label || url, url });
    } else if (o.kind === 'file') {
      const fileName = typeof o.fileName === 'string' ? o.fileName : '';
      const dataUrl = typeof o.dataUrl === 'string' ? o.dataUrl : '';
      if (!fileName || !dataUrl.startsWith('data:')) continue;
      const mimeType = typeof o.mimeType === 'string' ? o.mimeType : 'application/octet-stream';
      const sizeBytes = typeof o.sizeBytes === 'number' && o.sizeBytes >= 0 ? o.sizeBytes : 0;
      out.push({ id, kind: 'file', fileName, mimeType, sizeBytes, dataUrl });
    }
  }
  return out;
}

/**
 * Normalizes a stored or API-shaped object into ProjectConfig, or null if unusable.
 * Requires a valid projectTypeId for workspace-style configs.
 */
export function parseProjectConfig(data: unknown, requireProjectType = false): ProjectConfig | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  let projectTypeId = typeof o.projectTypeId === 'string' ? o.projectTypeId : '';
  if (projectTypeId === 'style-tile') projectTypeId = 'mood-board';
  if (requireProjectType && (!projectTypeId || !validProjectTypeIds.has(projectTypeId))) return null;
  if (projectTypeId && !validProjectTypeIds.has(projectTypeId)) return null;
  if (typeof o.id !== 'string' || !o.id) return null;

  const selectedBlockIds = Array.isArray(o.selectedBlockIds)
    ? o.selectedBlockIds.filter((id): id is string => typeof id === 'string')
    : [];
  const techChoices =
    o.techChoices && typeof o.techChoices === 'object' && !Array.isArray(o.techChoices)
      ? (o.techChoices as Record<string, string>)
      : {};
  const typeDetails =
    o.typeDetails && typeof o.typeDetails === 'object' && !Array.isArray(o.typeDetails)
      ? (o.typeDetails as Record<string, string>)
      : {};

  const subagentModels: Record<string, string> = {};
  if (o.subagentModels && typeof o.subagentModels === 'object' && !Array.isArray(o.subagentModels)) {
    for (const [k, v] of Object.entries(o.subagentModels as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) subagentModels[k] = v.trim();
    }
  }

  const onboardingCompleted =
    typeof o.onboardingCompleted === 'boolean' ? o.onboardingCompleted : true;

  const useSubagents = typeof o.useSubagents === 'boolean' ? o.useSubagents : true;

  const buildAsYouGo = typeof o.buildAsYouGo === 'boolean' ? o.buildAsYouGo : false;

  const preferOpenSourceOnly =
    typeof o.preferOpenSourceOnly === 'boolean' ? o.preferOpenSourceOnly : false;

  return {
    id: o.id,
    name: typeof o.name === 'string' ? o.name : '',
    projectTypeId,
    selectedBlockIds,
    techChoices,
    projectDescription: typeof o.projectDescription === 'string' ? o.projectDescription : '',
    typeDetails,
    buildAsYouGo,
    useSubagents,
    preferOpenSourceOnly,
    subagentModels,
    selectedModelId: typeof o.selectedModelId === 'string' ? o.selectedModelId : '',
    selectedToolIds: Array.isArray(o.selectedToolIds)
      ? (o.selectedToolIds as string[]).filter((id): id is string => typeof id === 'string').slice(0, 1)
      : [],
    selectedLibraryIds: Array.isArray(o.selectedLibraryIds)
      ? (o.selectedLibraryIds as string[]).filter((id): id is string => typeof id === 'string')
      : [],
    selectedIntegrationIds: Array.isArray(o.selectedIntegrationIds)
      ? (o.selectedIntegrationIds as string[]).filter((id): id is string => typeof id === 'string')
      : [],
    resources: parseResources(o.resources),
    onboardingCompleted,
    createdAt: typeof o.createdAt === 'number' ? o.createdAt : Date.now(),
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : Date.now(),
  };
}
