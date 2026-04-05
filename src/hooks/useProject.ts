import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProjectConfig, ProjectFileResource, ProjectResource, Tier } from '../types';
import { blocks } from '../data/blocks';
import { techOptions } from '../data/techOptions';
import { blockLibraries } from '../data/libraries';
import { projectTypes } from '../data/projectTypes';
import { modelsForToolAndTier, toolRecommendations } from '../data/models';

const WORKSPACE_STORAGE_KEY = 'tech-pack-workspace';
const validProjectTypeIds = new Set(projectTypes.map((t) => t.id));

function createEmptyConfig(): ProjectConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    projectTypeId: '',
    selectedBlockIds: [],
    techChoices: {},
    projectDescription: '',
    typeDetails: {},
    selectedModelId: '',
    selectedToolIds: [],
    selectedLibraryIds: [],
    selectedIntegrationIds: [],
    resources: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

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

function loadWorkspaceFromStorage(): ProjectConfig | null {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.projectTypeId !== 'string' || !o.projectTypeId) return null;
    const projectTypeId =
      o.projectTypeId === 'style-tile' ? 'mood-board' : o.projectTypeId;
    if (!validProjectTypeIds.has(projectTypeId)) return null;
    if (typeof o.id !== 'string') return null;

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

    return {
      id: o.id,
      name: typeof o.name === 'string' ? o.name : '',
      projectTypeId,
      selectedBlockIds,
      techChoices,
      projectDescription: typeof o.projectDescription === 'string' ? o.projectDescription : '',
      typeDetails,
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
      createdAt: typeof o.createdAt === 'number' ? o.createdAt : Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

export function useProject() {
  const [config, setConfig] = useState<ProjectConfig>(() => {
    return loadWorkspaceFromStorage() ?? createEmptyConfig();
  });

  useEffect(() => {
    if (!config.projectTypeId) {
      try {
        window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      } catch {
        /* ignore quota / private mode */
      }
      return;
    }
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  const setProjectType = useCallback((typeId: string) => {
    setConfig((prev) => {
      if (!typeId) {
        return {
          ...prev,
          projectTypeId: '',
          selectedBlockIds: [],
          techChoices: {},
          typeDetails: {},
          selectedModelId: '',
          selectedToolIds: [],
          selectedLibraryIds: [],
          selectedIntegrationIds: [],
          resources: [],
          updatedAt: Date.now(),
        };
      }

      const tier = getTierForType(typeId);
      const defaultBlockIds = blocks
        .filter((b) => {
          const status = b.statusForTier(tier);
          return status === 'required';
        })
        .map((b) => b.id);

      const defaultTechChoices: Record<string, string> = {};
      for (const blockId of defaultBlockIds) {
        const defaultOption = techOptions.find(
          (o) => o.blockId === blockId && o.isDefault,
        );
        if (defaultOption) {
          defaultTechChoices[blockId] = defaultOption.id;
        }
      }

      const defaultTools = toolRecommendations
        .filter((t) => t.tiers.includes(tier))
        .sort((a, b) => (a.id === 'cursor' ? -1 : b.id === 'cursor' ? 1 : 0))
        .slice(0, 1)
        .map((t) => t.id);
      const primaryToolId = defaultTools[0];
      const modelsForDefaultTool = modelsForToolAndTier(primaryToolId, tier);
      const defaultModel = modelsForDefaultTool[0];

      return {
        ...prev,
        projectTypeId: typeId,
        selectedBlockIds: defaultBlockIds,
        techChoices: defaultTechChoices,
        typeDetails: {},
        selectedModelId: defaultModel?.id ?? '',
        selectedToolIds: defaultTools,
        selectedLibraryIds: [],
        selectedIntegrationIds: [],
        resources: [],
        updatedAt: Date.now(),
      };
    });
  }, []);

  const toggleBlock = useCallback((blockId: string) => {
    setConfig((prev) => {
      const isSelected = prev.selectedBlockIds.includes(blockId);
      const selectedBlockIds = isSelected
        ? prev.selectedBlockIds.filter((id) => id !== blockId)
        : [...prev.selectedBlockIds, blockId];

      const techChoices = { ...prev.techChoices };
      let selectedLibraryIds = prev.selectedLibraryIds;
      if (isSelected) {
        delete techChoices[blockId];
        const blockLibIds = new Set(
          blockLibraries.filter((l) => l.blockId === blockId).map((l) => l.id),
        );
        selectedLibraryIds = selectedLibraryIds.filter((id) => !blockLibIds.has(id));
      } else {
        const defaultOption = techOptions.find(
          (o) => o.blockId === blockId && o.isDefault,
        );
        if (defaultOption) {
          techChoices[blockId] = defaultOption.id;
        }
      }

      return { ...prev, selectedBlockIds, techChoices, selectedLibraryIds, updatedAt: Date.now() };
    });
  }, []);

  const setTechChoice = useCallback((blockId: string, optionId: string) => {
    setConfig((prev) => ({
      ...prev,
      techChoices: { ...prev.techChoices, [blockId]: optionId },
      updatedAt: Date.now(),
    }));
  }, []);

  const setProjectName = useCallback((name: string) => {
    setConfig((prev) => ({ ...prev, name, updatedAt: Date.now() }));
  }, []);

  const setProjectDescription = useCallback((description: string) => {
    setConfig((prev) => ({
      ...prev,
      projectDescription: description,
      updatedAt: Date.now(),
    }));
  }, []);

  const setTypeDetail = useCallback((fieldId: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      typeDetails: { ...prev.typeDetails, [fieldId]: value },
      updatedAt: Date.now(),
    }));
  }, []);

  const setModel = useCallback((modelId: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedModelId: modelId,
      updatedAt: Date.now(),
    }));
  }, []);

  const toggleIntegration = useCallback((integrationId: string) => {
    setConfig((prev) => {
      const has = prev.selectedIntegrationIds.includes(integrationId);
      return {
        ...prev,
        selectedIntegrationIds: has
          ? prev.selectedIntegrationIds.filter((id) => id !== integrationId)
          : [...prev.selectedIntegrationIds, integrationId],
        updatedAt: Date.now(),
      };
    });
  }, []);

  const toggleLibrary = useCallback((libraryId: string) => {
    setConfig((prev) => {
      const has = prev.selectedLibraryIds.includes(libraryId);
      return {
        ...prev,
        selectedLibraryIds: has
          ? prev.selectedLibraryIds.filter((id) => id !== libraryId)
          : [...prev.selectedLibraryIds, libraryId],
        updatedAt: Date.now(),
      };
    });
  }, []);

  const addResourceUrl = useCallback((label: string, rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const safeLabel = label.trim() || url;
    setConfig((prev) => ({
      ...prev,
      resources: [
        ...(prev.resources ?? []),
        { id: crypto.randomUUID(), kind: 'url', label: safeLabel, url },
      ],
      updatedAt: Date.now(),
    }));
  }, []);

  const addResourceFile = useCallback((file: Omit<ProjectFileResource, 'id' | 'kind'>) => {
    setConfig((prev) => ({
      ...prev,
      resources: [
        ...(prev.resources ?? []),
        { id: crypto.randomUUID(), kind: 'file', ...file },
      ],
      updatedAt: Date.now(),
    }));
  }, []);

  const removeResource = useCallback((resourceId: string) => {
    setConfig((prev) => ({
      ...prev,
      resources: (prev.resources ?? []).filter((r) => r.id !== resourceId),
      updatedAt: Date.now(),
    }));
  }, []);

  const setTool = useCallback((toolId: string | null) => {
    setConfig((prev) => {
      const tier = getTierForType(prev.projectTypeId);
      const nextToolIds = toolId ? [toolId] : [];
      const allowed = modelsForToolAndTier(toolId ?? undefined, tier);
      const currentOk = allowed.some((m) => m.id === prev.selectedModelId);
      const nextModelId = currentOk ? prev.selectedModelId : (allowed[0]?.id ?? '');
      return {
        ...prev,
        selectedToolIds: nextToolIds,
        selectedModelId: nextModelId,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const tier: Tier = useMemo(
    () => getTierForType(config.projectTypeId),
    [config.projectTypeId],
  );

  return {
    config,
    tier,
    setProjectType,
    toggleBlock,
    setTechChoice,
    setProjectName,
    setProjectDescription,
    setTypeDetail,
    setModel,
    setTool,
    toggleLibrary,
    toggleIntegration,
    addResourceUrl,
    addResourceFile,
    removeResource,
  };
}

function getTierForType(typeId: string): Tier {
  const tierMap: Record<string, Tier> = {
    'style-tile': 1,
    markdown: 1,
    'mood-board': 1,
    'plugin-extension': 2,
    prototype: 3,
    website: 4,
    'web-app': 5,
    'ios-mac-app': 5,
    saas: 6,
    platform: 7,
  };
  return tierMap[typeId] ?? 1;
}
