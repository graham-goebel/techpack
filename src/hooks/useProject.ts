import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProjectConfig, ProjectFileResource, Tier } from '../types';
import { blocks } from '../data/blocks';
import { techOptions } from '../data/techOptions';
import { blockLibraries } from '../data/libraries';
import { getTierForProjectTypeId } from '../data/projectTypes';
import {
  modelsForToolAndTier,
  sanitizeSubagentModelsForTool,
  toolRecommendations,
} from '../data/models';
import { parseProjectConfig } from '../utils/projectConfigParse';

const WORKSPACE_STORAGE_KEY = 'tech-pack-workspace';

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
    buildAsYouGo: false,
    useSubagents: true,
    preferOpenSourceOnly: false,
    subagentModels: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadWorkspaceFromStorage(): ProjectConfig | null {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const config = parseProjectConfig(parsed, true);
    if (!config) return null;
    const tier = getTierForProjectTypeId(config.projectTypeId);
    const toolId = config.selectedToolIds[0];
    return {
      ...config,
      subagentModels: sanitizeSubagentModelsForTool(config.subagentModels ?? {}, toolId, tier),
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
          buildAsYouGo: false,
          useSubagents: true,
          preferOpenSourceOnly: false,
          subagentModels: {},
          onboardingCompleted: undefined,
          updatedAt: Date.now(),
        };
      }

      const tier = getTierForProjectTypeId(typeId);
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
        buildAsYouGo: false,
        useSubagents: true,
        preferOpenSourceOnly: false,
        subagentModels: {},
        onboardingCompleted: false,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      onboardingCompleted: true,
      updatedAt: Date.now(),
    }));
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

  const setUseSubagents = useCallback((value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      useSubagents: value,
      updatedAt: Date.now(),
    }));
  }, []);

  const setBuildAsYouGo = useCallback((value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      buildAsYouGo: value,
      updatedAt: Date.now(),
    }));
  }, []);

  const setPreferOpenSourceOnly = useCallback((value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      preferOpenSourceOnly: value,
      updatedAt: Date.now(),
    }));
  }, []);

  const setSubagentModel = useCallback((laneId: string, modelId: string) => {
    setConfig((prev) => {
      const tier = getTierForProjectTypeId(prev.projectTypeId);
      const toolId = prev.selectedToolIds[0];
      const allowed = new Set(modelsForToolAndTier(toolId, tier).map((m) => m.id));
      const next = { ...prev.subagentModels };
      const trimmed = modelId.trim();
      if (!trimmed) {
        delete next[laneId];
      } else if (allowed.has(trimmed)) {
        next[laneId] = trimmed;
      }
      return { ...prev, subagentModels: next, updatedAt: Date.now() };
    });
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
      const tier = getTierForProjectTypeId(prev.projectTypeId);
      const nextToolIds = toolId ? [toolId] : [];
      const allowed = modelsForToolAndTier(toolId ?? undefined, tier);
      const currentOk = allowed.some((m) => m.id === prev.selectedModelId);
      const nextModelId = currentOk ? prev.selectedModelId : (allowed[0]?.id ?? '');
      const subagentModels = sanitizeSubagentModelsForTool(
        prev.subagentModels ?? {},
        toolId ?? undefined,
        tier,
      );
      return {
        ...prev,
        selectedToolIds: nextToolIds,
        selectedModelId: nextModelId,
        subagentModels,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const hydrateWorkspace = useCallback((data: unknown) => {
    const parsed = parseProjectConfig(data, false);
    if (!parsed) return;
    const tier = getTierForProjectTypeId(parsed.projectTypeId);
    const allowedTools = toolRecommendations
      .filter((t) => t.tiers.includes(tier))
      .sort((a, b) => (a.id === 'cursor' ? -1 : b.id === 'cursor' ? 1 : 0));
    const toolId = parsed.selectedToolIds[0];
    const toolOk = toolId && allowedTools.some((t) => t.id === toolId);
    const nextToolIds = toolOk && toolId ? [toolId] : allowedTools.length ? [allowedTools[0].id] : [];
    const primaryToolId = nextToolIds[0];
    const models = modelsForToolAndTier(primaryToolId, tier);
    const modelOk = models.some((m) => m.id === parsed.selectedModelId);
    const nextModelId = modelOk ? parsed.selectedModelId : (models[0]?.id ?? '');
    const subagentModels = sanitizeSubagentModelsForTool(
      parsed.subagentModels ?? {},
      primaryToolId,
      tier,
    );

    setConfig({
      ...parsed,
      selectedToolIds: nextToolIds,
      selectedModelId: nextModelId,
      subagentModels,
      onboardingCompleted: parsed.projectTypeId ? true : parsed.onboardingCompleted,
      updatedAt: Date.now(),
    });
  }, []);

  const resetWorkspace = useCallback(() => {
    setConfig(createEmptyConfig());
    try {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const tier: Tier = useMemo(
    () => getTierForProjectTypeId(config.projectTypeId),
    [config.projectTypeId],
  );

  return {
    config,
    tier,
    setProjectType,
    completeOnboarding,
    toggleBlock,
    setTechChoice,
    setProjectName,
    setProjectDescription,
    setTypeDetail,
    setModel,
    setUseSubagents,
    setBuildAsYouGo,
    setPreferOpenSourceOnly,
    setSubagentModel,
    setTool,
    toggleLibrary,
    toggleIntegration,
    addResourceUrl,
    addResourceFile,
    removeResource,
    hydrateWorkspace,
    resetWorkspace,
  };
}
