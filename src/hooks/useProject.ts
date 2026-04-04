import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProjectConfig, Tier } from '../types';
import { blocks } from '../data/blocks';
import { techOptions } from '../data/techOptions';
import { projectTypes } from '../data/projectTypes';
import { modelRecommendations, toolRecommendations } from '../data/models';

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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
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
        ? (o.selectedToolIds as string[]).filter((id): id is string => typeof id === 'string')
        : [],
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
          updatedAt: Date.now(),
        };
      }

      const tier = getTierForType(typeId);
      const defaultBlockIds = blocks
        .filter((b) => {
          const status = b.statusForTier(tier);
          return status === 'required' || status === 'recommended';
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

      const defaultModel = modelRecommendations.find((m) => m.tiers.includes(tier));
      const defaultTools = toolRecommendations
        .filter((t) => t.tiers.includes(tier))
        .sort((a, b) => (a.id === 'cursor' ? -1 : b.id === 'cursor' ? 1 : 0))
        .slice(0, 1)
        .map((t) => t.id);

      return {
        ...prev,
        projectTypeId: typeId,
        selectedBlockIds: defaultBlockIds,
        techChoices: defaultTechChoices,
        typeDetails: {},
        selectedModelId: defaultModel?.id ?? '',
        selectedToolIds: defaultTools,
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
      if (isSelected) {
        delete techChoices[blockId];
      } else {
        const defaultOption = techOptions.find(
          (o) => o.blockId === blockId && o.isDefault,
        );
        if (defaultOption) {
          techChoices[blockId] = defaultOption.id;
        }
      }

      return { ...prev, selectedBlockIds, techChoices, updatedAt: Date.now() };
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

  const toggleTool = useCallback((toolId: string) => {
    setConfig((prev) => {
      const has = prev.selectedToolIds.includes(toolId);
      return {
        ...prev,
        selectedToolIds: has
          ? prev.selectedToolIds.filter((id) => id !== toolId)
          : [...prev.selectedToolIds, toolId],
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
    toggleTool,
  };
}

function getTierForType(typeId: string): Tier {
  const tierMap: Record<string, Tier> = {
    'style-tile': 1, // legacy id — workspace migrates to mood-board on load
    'mood-board': 1,
    'plugin-extension': 2,
    prototype: 3,
    website: 4,
    'web-app': 5,
    saas: 6,
    platform: 7,
  };
  return tierMap[typeId] ?? 1;
}
