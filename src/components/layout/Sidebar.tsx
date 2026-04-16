import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Block, ModelRecommendation, ProjectConfig, ProjectFileResource, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { getTypeDetailFields } from '../../data/projectTypeDetailFields';
import { blocks } from '../../data/blocks';
import { groupVisibleBlocksByStackLayer } from '../../data/stackLayers';
import { techOptions } from '../../data/techOptions';
import { blockLibraries } from '../../data/libraries';
import { modelsForToolAndTier, toolRecommendations } from '../../data/models';
import { getSubagentLaneForBlock, type SubagentLane } from '../../data/blockSubagentLane';
import {
  getVisibleIntegrations,
  INTEGRATION_CATEGORY_LABELS,
  INTEGRATION_CATEGORY_ORDER,
  type IntegrationCategory,
  type IntegrationItem,
} from '../../data/integrations';
import { IntegrationBrandIcon } from '../icons/IntegrationBrandIcon';
import { BlockOcticon } from '../icons/OcticonById';
import { ToolLogoGlyph } from '../icons/ToolLogoGlyph';
import { ComplexityDots } from '../ui/ComplexityDots';
import { ResourcesPanel } from '../resources/ResourcesPanel';
import { CustomSelect } from '../ui/CustomSelect';
import { TYPE_DETAIL_CHIP_BASE } from '../ui/typeDetailChipStyles';
import { LibraryChip } from '../ui/LibraryChip';

interface SidebarProps {
  config: ProjectConfig;
  tier: Tier;
  onSetProjectType: (typeId: string) => void;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onSetName: (name: string) => void;
  onSetDescription: (desc: string) => void;
  onSetTypeDetail: (fieldId: string, value: string) => void;
  onSetModel: (modelId: string) => void;
  onSetBuildAsYouGo: (value: boolean) => void;
  onSetPreferOpenSourceOnly: (value: boolean) => void;
  onSetUseSubagents: (value: boolean) => void;
  onSetSubagentModel: (laneId: string, modelId: string) => void;
  onSetTool: (toolId: string | null) => void;
  onToggleLibrary: (libraryId: string) => void;
  onToggleIntegration: (integrationId: string) => void;
  onAddResourceUrl: (label: string, url: string) => void;
  onAddResourceFile: (file: Omit<ProjectFileResource, 'id' | 'kind'>) => void;
  onRemoveResource: (id: string) => void;
  /** Logo control: hide the main panel so main content can use full width; rail stays visible */
  onCollapseSidebar: () => void;
  onExpandSidebar: () => void;
  collapsed: boolean;
  onGoHome: () => void;
}

type SectionId = 'type' | 'project' | 'blocks' | 'resources' | 'integrations';

/** Uppercase rail / field labels — single weight + scale in scroll column */
const SIDEBAR_LABEL =
  'text-[8px] font-semibold uppercase tracking-[0.1em] text-ink-secondary leading-snug';
/** Stack layer groups, Recommended — matches Resources section titles (12px, sentence case) */
const SIDEBAR_SECTION_LABEL = 'text-[12px] font-semibold tracking-normal text-ink-secondary';
/** leading-snug avoids ascender clipping; min-w-0 + break-words so long labels wrap in narrow sidebar */
const SIDEBAR_FIELD_LABEL = `block w-full min-w-0 break-words ${SIDEBAR_LABEL} mb-1`;
/** Panel tab titles (Overview, Details, Blocks, …) — primary hierarchy above rail body */
const SIDEBAR_PANEL_TITLE =
  'text-[18px] font-semibold tracking-tight text-ink leading-tight';
/** Closed trigger / list primary line — matches project type + CustomSelect sidebar */
const SIDEBAR_FIELD_VALUE = 'text-xs font-semibold text-ink leading-tight';
/** Primary line inside cards / selectors (toggles, chips) — 10px scale */
const SIDEBAR_CARD_PRIMARY = 'text-[10px] font-semibold text-ink leading-tight';
/** Inputs & multi-line fields in the rail — same 10px scale as CustomSelect sidebar + card rows */
const SIDEBAR_BODY = 'text-[10px] leading-snug text-ink';

/** Hover hint for compact toggle rows (label only; full text in tooltip above row) */
const SIDEBAR_HELP_TOOLTIP =
  'pointer-events-none absolute z-[230] left-3 right-3 bottom-full mb-1 rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100';

function SidebarRailNav({
  activeRail,
  onNavigate,
  showIntegrations,
  onLogoClick,
  logoAction,
  onGoHome,
}: {
  activeRail: SectionId;
  onNavigate: (id: SectionId) => void;
  showIntegrations: boolean;
  onLogoClick: () => void;
  logoAction: 'collapse' | 'expand';
  onGoHome: () => void;
}) {
  const Item = ({
    id,
    label,
    children,
  }: {
    id: SectionId;
    label: string;
    children: ReactNode;
  }) => {
    const active = activeRail === id;
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={active ? 'true' : undefined}
        onClick={() => onNavigate(id)}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          active
            ? 'bg-ink text-surface'
            : 'text-ink-muted hover:bg-black/[0.06] hover:text-ink'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <nav
      className="flex h-full min-h-0 w-[52px] shrink-0 flex-col items-center gap-0.5 self-stretch bg-surface py-2 pt-3"
      aria-label="Sidebar sections"
    >
      <button
        type="button"
        onClick={onLogoClick}
        className="mb-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-dashed border-rule-strong bg-white text-[10px] font-mono font-bold tracking-tight text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.04)] transition-opacity hover:opacity-90"
        title={logoAction === 'collapse' ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label={logoAction === 'collapse' ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        TP
      </button>
      <Item id="type" label="Overview">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </Item>
      <Item id="project" label="Project details">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </Item>
      <Item id="blocks" label="Blocks">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </Item>
      <Item id="resources" label="Resources">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </Item>
      {showIntegrations ? (
        <Item id="integrations" label="Integrations">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 001 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
            />
          </svg>
        </Item>
      ) : null}
      <div className="flex-1 min-h-[12px]" aria-hidden />
      <button
        type="button"
        onClick={onGoHome}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink"
        aria-label="Home"
        title="Home"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>
    </nav>
  );
}

function SidebarPanelHeader({
  label,
  description,
  count,
}: {
  label: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="shrink-0 px-3 pt-4 pb-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className={`m-0 ${SIDEBAR_PANEL_TITLE}`}>{label}</h2>
        {count !== undefined ? (
          <span className="text-xs font-medium tabular-nums text-ink-muted">{count}</span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 text-[10px] leading-snug text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}

function SidebarBlockGridCard({
  block,
  tier,
  config,
  variant,
  isExpanded,
  onToggleExpand,
  onCornerAction,
  cornerLabel,
}: {
  block: Block;
  tier: Tier;
  config: ProjectConfig;
  variant: 'included' | 'recommended';
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCornerAction: () => void;
  cornerLabel: string;
}) {
  const isRequired = block.statusForTier(tier) === 'required';
  const techForPreview =
    techOptions.find((o) => o.id === config.techChoices[block.id]) ??
    techOptions.find((o) => o.blockId === block.id && o.isDefault);
  const summaryId = `sidebar-block-sum-${block.id}`;

  return (
    <div className="group/card relative min-w-0">
      <span id={summaryId} className="sr-only">
        {block.summary}
      </span>
      <div
        className={`relative flex items-center gap-px rounded-lg px-2 py-1.5 transition-colors ${
          isExpanded
            ? 'bg-surface-raised ring-1 ring-inset ring-ink/[0.08]'
            : 'bg-white hover:bg-black/[0.03]'
        } ${variant === 'recommended' && !isExpanded ? 'opacity-[0.72] hover:opacity-100' : ''}`}
      >
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-describedby={summaryId}
          className="flex min-h-[3.5rem] min-w-0 flex-1 flex-row items-center gap-3 py-1 pl-1 pr-1 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
            <BlockOcticon blockId={block.id} size={22} className="text-ink-secondary" />
          </div>
          <span className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5">
            <span className="line-clamp-2 text-[12px] font-semibold leading-[1.25] text-ink">
              {block.name}
            </span>
            <span className="line-clamp-2 w-full text-[10px] leading-snug text-ink-muted">{block.summary}</span>
            {techForPreview ? (
              <span className="line-clamp-1 w-full text-[10px] text-ink-faint">{techForPreview.name}</span>
            ) : null}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!isRequired ? (
          <button
            type="button"
            onClick={onCornerAction}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink ${
              variant === 'included'
                ? 'opacity-0 group-hover/card:opacity-100 group-focus-within/card:opacity-100'
                : ''
            }`}
            aria-label={cornerLabel}
            title={cornerLabel}
          >
            {variant === 'included' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      {!isExpanded ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-0 right-0 top-full z-[240] mt-1.5 rounded-md border border-white/12 bg-ink px-2.5 py-2 text-left text-[10px] leading-snug text-surface/90 shadow-lg shadow-black/30 opacity-0 transition-all duration-150 translate-y-0.5 group-hover/card:visible group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:visible group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 invisible scale-95 group-hover/card:scale-100 group-focus-within/card:scale-100"
        >
          <p className="mb-1 text-[10px] font-semibold text-surface">{block.name}</p>
          <p className="text-surface/85">{block.summary}</p>
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({
  config,
  tier,
  onSetProjectType,
  onToggleBlock,
  onSetTechChoice,
  onSetName,
  onSetDescription,
  onSetTypeDetail,
  onSetModel,
  onSetBuildAsYouGo,
  onSetPreferOpenSourceOnly,
  onSetUseSubagents,
  onSetSubagentModel,
  onSetTool,
  onToggleLibrary,
  onToggleIntegration,
  onAddResourceUrl,
  onAddResourceFile,
  onRemoveResource,
  onCollapseSidebar,
  onExpandSidebar,
  collapsed,
  onGoHome,
}: SidebarProps) {
  /** Exactly one rail section visible at a time (no stacked accordion). */
  const [activePanel, setActivePanel] = useState<SectionId>('type');

  const handleRailNavigate = useCallback(
    (id: SectionId) => {
      if (collapsed) onExpandSidebar();
      setActivePanel(id);
    },
    [collapsed, onExpandSidebar],
  );
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [projectTypeMenuOpen, setProjectTypeMenuOpen] = useState(false);
  const projectTypeMenuRef = useRef<HTMLDivElement>(null);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const toolMenuRef = useRef<HTMLDivElement>(null);
  const [integrationTab, setIntegrationTab] = useState<IntegrationCategory>('skill');

  const selectedProjectType = useMemo(
    () => projectTypes.find((t) => t.id === config.projectTypeId),
    [config.projectTypeId],
  );

  useEffect(() => {
    if (!projectTypeMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = projectTypeMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setProjectTypeMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProjectTypeMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [projectTypeMenuOpen]);

  useEffect(() => {
    if (activePanel !== 'type') setProjectTypeMenuOpen(false);
  }, [activePanel]);

  useEffect(() => {
    if (!toolMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = toolMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setToolMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [toolMenuOpen]);

  useEffect(() => {
    if (activePanel !== 'type') setToolMenuOpen(false);
  }, [activePanel]);

  const visibleBlocks = config.projectTypeId
    ? blocks
        .filter((b) => b.statusForTier(tier) !== 'hidden')
        .sort((a, b) => {
          const order = { required: 0, recommended: 1, optional: 2, hidden: 3 };
          return order[a.statusForTier(tier)] - order[b.statusForTier(tier)];
        })
    : [];

  const includedBlocks = visibleBlocks.filter(
    (b) => b.statusForTier(tier) === 'required' || config.selectedBlockIds.includes(b.id),
  );
  const recommendedBlocks = visibleBlocks.filter(
    (b) =>
      b.statusForTier(tier) !== 'required' &&
      !config.selectedBlockIds.includes(b.id),
  );

  const selectedBlocksForMeta = blocks.filter((b) => config.selectedBlockIds.includes(b.id));

  const typeDetailFields = config.projectTypeId
    ? getTypeDetailFields(config.projectTypeId)
    : [];
  const typeDetails = config.typeDetails ?? {};

  const selectedToolId = config.selectedToolIds[0] ?? '';
  const selectedTool = selectedToolId
    ? toolRecommendations.find((t) => t.id === selectedToolId)
    : undefined;
  const models = useMemo(
    () => modelsForToolAndTier(selectedToolId || undefined, tier),
    [selectedToolId, tier],
  );
  const primaryModelMeta = useMemo(
    () => models.find((m) => m.id === config.selectedModelId),
    [models, config.selectedModelId],
  );
  const tools = toolRecommendations
    .filter((t) => t.tiers.includes(tier))
    .sort((a, b) => (a.id === 'cursor' ? -1 : b.id === 'cursor' ? 1 : 0));

  const visibleIntegrations = useMemo(
    () =>
      config.projectTypeId
        ? getVisibleIntegrations(config.projectTypeId, tier, config.projectDescription)
        : [],
    [config.projectTypeId, config.projectDescription, tier],
  );

  const integrationsByCategory = useMemo(() => {
    const map = new Map<IntegrationCategory, IntegrationItem[]>();
    for (const c of INTEGRATION_CATEGORY_ORDER) map.set(c, []);
    for (const item of visibleIntegrations) {
      map.get(item.category)?.push(item);
    }
    return map;
  }, [visibleIntegrations]);

  useEffect(() => {
    const countIn = (c: IntegrationCategory) =>
      visibleIntegrations.filter((i) => i.category === c).length;
    setIntegrationTab((prev) => {
      if (countIn(prev) > 0) return prev;
      return INTEGRATION_CATEGORY_ORDER.find((c) => countIn(c) > 0) ?? prev;
    });
  }, [visibleIntegrations]);

  const [sidebarSearch, setSidebarSearch] = useState('');

  useEffect(() => {
    if (sidebarSearch.trim()) {
      setActivePanel('blocks');
    }
  }, [sidebarSearch]);

  useEffect(() => {
    if (visibleIntegrations.length === 0 && activePanel === 'integrations') {
      setActivePanel('type');
    }
  }, [visibleIntegrations.length, activePanel]);

  const blockMatches = useCallback(
    (b: Block) => {
      const q = sidebarSearch.trim().toLowerCase();
      if (!q) return true;
      return b.name.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q);
    },
    [sidebarSearch],
  );

  const includedGrouped = useMemo(
    () => groupVisibleBlocksByStackLayer(includedBlocks.filter(blockMatches)),
    [includedBlocks, blockMatches],
  );

  const recommendedFiltered = useMemo(
    () => recommendedBlocks.filter(blockMatches),
    [recommendedBlocks, blockMatches],
  );

  const recommendedGrouped = useMemo(
    () => groupVisibleBlocksByStackLayer(recommendedFiltered),
    [recommendedFiltered],
  );

  const renderExpandedBlockPanel = (block: Block): ReactNode => {
    if (expandedBlockId !== block.id) {
      return null;
    }
    const isInProject = includedBlocks.some((b) => b.id === block.id);
    return (
      <div className="overflow-hidden bg-surface-raised/90">
        <div className="flex items-center justify-between gap-2 border-b border-rule px-3 py-2">
          <span className="min-w-0 truncate text-[10px] font-semibold text-ink">{block.name}</span>
          <button
            type="button"
            onClick={() => setExpandedBlockId(null)}
            className="shrink-0 rounded-lg p-1 text-ink-muted transition-colors hover:bg-white hover:text-ink"
            aria-label="Close block details"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {isInProject ? (
          <IncludedBlockExpandedPanel
            block={block}
            config={config}
            models={models}
            primaryModelMeta={primaryModelMeta}
            onSetTechChoice={onSetTechChoice}
            onToggleLibrary={onToggleLibrary}
            onSetSubagentModel={onSetSubagentModel}
          />
        ) : (
          <>
            <div className="space-y-2 border-b border-rule px-2.5 py-2.5">
              <p className="text-[10px] leading-relaxed text-ink-secondary">{block.explanation}</p>
              <div>
                <p className={`mb-0.5 ${SIDEBAR_LABEL}`}>Why</p>
                <p className="text-[10px] leading-relaxed text-ink-secondary">{block.whyNeeded}</p>
              </div>
            </div>
            {config.useSubagents ? (
              <BlockSubagentModelRow
                lane={getSubagentLaneForBlock(block.id)}
                blockId={block.id}
                config={config}
                models={models}
                primaryModelMeta={primaryModelMeta}
                onSetSubagentModel={onSetSubagentModel}
              />
            ) : null}
            <div className="px-2.5 pb-2.5 pt-2">
              <button
                type="button"
                onClick={() => onToggleBlock(block.id)}
                className="flex w-full items-center justify-center gap-1.5 border border-rule py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
                Add to project
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <aside className="relative flex h-screen w-full min-w-0 shrink-0 overflow-hidden border-r border-rule bg-surface">
      <SidebarRailNav
        activeRail={activePanel}
        onNavigate={handleRailNavigate}
        showIntegrations={visibleIntegrations.length > 0}
        onLogoClick={collapsed ? onExpandSidebar : onCollapseSidebar}
        logoAction={collapsed ? 'expand' : 'collapse'}
        onGoHome={onGoHome}
      />
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-l border-zinc-200/80 bg-surface ${
          collapsed ? 'hidden' : ''
        }`}
      >
      {/* Masthead — hidden for now; same height + border as main chrome row when shown */}
      <div className="app-chrome-row hidden shrink-0 flex flex-col justify-center border-b border-rule-strong min-w-0 px-4">
        <div
          className="text-[17px] font-semibold text-ink leading-tight tracking-[-0.02em] truncate min-w-0"
          title={config.name.trim() || undefined}
        >
          {config.name.trim() || 'Untitled'}
        </div>
        <div className="mt-1 min-w-0">
          {selectedProjectType ? (
            <div className="min-w-0 flex items-center gap-2 flex-wrap text-[10px] text-ink-muted uppercase tracking-[0.06em] leading-snug">
              <span className="font-semibold text-ink-secondary">{selectedProjectType.name}</span>
              <span className="text-rule shrink-0">|</span>
              <span className="shrink-0 tabular-nums">
                {selectedBlocksForMeta.length}/{visibleBlocks.length} blocks
              </span>
              {config.selectedLibraryIds.length > 0 && (
                <>
                  <span className="text-rule shrink-0">|</span>
                  <span className="shrink-0">
                    {config.selectedLibraryIds.length}{' '}
                    {config.selectedLibraryIds.length === 1 ? 'library' : 'libraries'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.15em] leading-snug min-w-0 truncate block">
              Tech Pack
            </span>
          )}
        </div>
      </div>

      {/* Single scroll column — one rail panel at a time */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-24">
          <div className="flex min-w-0 flex-col">
        {activePanel === 'type' && (
          <div className="animate-fade-in">
            <SidebarPanelHeader
              label="Overview"
              description="Project type, AI tool, model, and options for how briefs and stack prompts are generated."
            />
            <div className="px-3 pb-4 pt-1">
            <p id="sidebar-project-type-label" className={SIDEBAR_FIELD_LABEL}>
              Project type
            </p>
            <div className="relative" ref={projectTypeMenuRef}>
              <button
                type="button"
                onClick={() => setProjectTypeMenuOpen((o) => !o)}
                aria-expanded={projectTypeMenuOpen}
                aria-haspopup="listbox"
                aria-labelledby="sidebar-project-type-label"
                className="w-full flex items-start gap-2 px-3 py-4 text-left border border-rule/40 rounded-lg bg-white/35 hover:bg-white/50 backdrop-blur-sm transition-colors min-h-[4.25rem]"
              >
                <div className="min-w-0 flex-1 w-full">
                  {selectedProjectType ? (
                    <>
                      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                        <span className={`${SIDEBAR_FIELD_VALUE} text-ink truncate min-w-0`}>
                          {selectedProjectType.name}
                        </span>
                        <span aria-hidden className="shrink-0">
                          <ComplexityDots filled={selectedProjectType.tier} size="pill" />
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted leading-snug mt-1 line-clamp-2">
                        {selectedProjectType.tagline}
                      </p>
                    </>
                  ) : (
                    <span className={`${SIDEBAR_FIELD_VALUE} text-ink-faint`}>
                      Select project type…
                    </span>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 shrink-0 text-ink-muted mt-0.5 transition-transform duration-150 ${
                    projectTypeMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {projectTypeMenuOpen && (
                <div
                  className="absolute z-[230] left-0 right-0 mt-1 max-h-[min(22rem,65vh)] overflow-y-auto rounded-lg border border-rule bg-surface shadow-md py-1"
                  role="listbox"
                  aria-label="Project types"
                >
                  {projectTypes.map((type) => {
                    const isSelected = type.id === config.projectTypeId;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSetProjectType(type.id);
                          setProjectTypeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-4 min-h-[4.25rem] border-b border-rule last:border-b-0 transition-colors ${
                          isSelected ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                          <span className={`${SIDEBAR_FIELD_VALUE} truncate min-w-0 ${isSelected ? 'text-ink' : 'text-ink-secondary'}`}>
                            {type.name}
                          </span>
                          <span aria-hidden className="shrink-0">
                            <ComplexityDots filled={type.tier} size="pill" />
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted leading-snug mt-1.5 pl-0">
                          {type.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {config.projectTypeId && (
              <div className="mt-3 pt-3 space-y-3">
                <p className={`${SIDEBAR_LABEL} px-0.5`}>AI & tooling</p>
                {/* Tool dropdown — above model list */}
                <div className="relative" ref={toolMenuRef}>
                  <button
                    type="button"
                    onClick={() => setToolMenuOpen((o) => !o)}
                    aria-expanded={toolMenuOpen}
                    aria-haspopup="listbox"
                    aria-label="AI coding tool"
                    className="w-full flex items-start gap-2 px-3 py-4 text-left border border-rule/40 rounded-lg bg-white/35 hover:bg-white/50 backdrop-blur-sm transition-colors min-h-[4.25rem]"
                  >
                    <div className="min-w-0 flex-1">
                      {selectedTool ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <ToolLogoGlyph toolId={selectedTool.id} className="h-5 w-5 shrink-0 text-ink" />
                          <span className={`${SIDEBAR_FIELD_VALUE} truncate min-w-0`}>
                            {selectedTool.name}
                          </span>
                        </div>
                      ) : (
                        <span className={`${SIDEBAR_FIELD_VALUE} text-ink-faint`}>
                          Select tool…
                        </span>
                      )}
                    </div>
                    <svg
                      className={`h-4 w-4 shrink-0 text-ink-muted mt-0.5 transition-transform duration-150 ${
                        toolMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {toolMenuOpen && (
                    <div
                      className="absolute z-[230] left-0 right-0 mt-1 max-h-[min(22rem,65vh)] overflow-y-auto rounded-lg border border-rule bg-surface shadow-md py-1"
                      role="listbox"
                      aria-label="Tools"
                    >
                      {tools.map((t) => {
                        const isSelected = t.id === selectedToolId;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              onSetTool(t.id);
                              setToolMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-4 min-h-[4.25rem] border-b border-rule last:border-b-0 transition-colors ${
                              isSelected ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ToolLogoGlyph toolId={t.id} className="h-5 w-5 shrink-0 text-ink" />
                              <span className={`text-xs font-semibold leading-tight flex-1 truncate ${isSelected ? 'text-ink' : 'text-ink-secondary'}`}>
                                {t.name}
                              </span>
                              {t.url && (
                                <a
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-accent hover:underline shrink-0"
                                >
                                  ↗
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-ink-muted leading-snug mt-1.5 line-clamp-3">
                              {t.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Model — custom dropdown; same full-width field treatment as tool selector */}
                <div className="w-full min-w-0">
                  <p id="sidebar-primary-model-label" className={SIDEBAR_FIELD_LABEL}>
                    Model
                  </p>
                  {models.length === 0 ? (
                    <p className="mt-1 text-[10px] text-ink-faint leading-snug">
                      Choose a tool to see compatible models.
                    </p>
                  ) : (
                    <CustomSelect
                      id="sidebar-primary-model"
                      value={config.selectedModelId}
                      onChange={onSetModel}
                      options={models.map((m) => ({
                        value: m.id,
                        label: `${m.name} (${m.provider})`,
                        description: m.reasoning,
                      }))}
                      size="md"
                      variant="sidebar"
                      placeholder="Select model…"
                      listClassName="max-h-[min(22rem,55vh)]"
                      aria-labelledby="sidebar-primary-model-label"
                      className="mt-1"
                      triggerClassName="!border-rule/40 !bg-white/35 backdrop-blur-sm hover:!bg-white/50 rounded-lg"
                    />
                  )}
                </div>

                <p className={`${SIDEBAR_LABEL} px-0.5`}>Process settings</p>
                <div className="overflow-visible rounded-lg border border-rule bg-surface divide-y divide-rule">
                  <div className="group relative flex items-center justify-between gap-3 px-3 py-2.5">
                    <div id="sidebar-subagents-desc" className="sr-only">
                      Per-block lane models, stack chips, and prompt routing. Off = primary model only.
                      Subagent models for focused sessions are set per block — open the Blocks tab, expand a block,
                      and pick a model for its lane (or use primary).
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${SIDEBAR_CARD_PRIMARY} cursor-help`}>Use subagents</p>
                    </div>
                    <div
                      role="tooltip"
                      className={SIDEBAR_HELP_TOOLTIP}
                      aria-hidden
                    >
                      <p className="mb-1.5">
                        Per-block lane models, stack chips, and prompt routing. Off = primary model only.
                      </p>
                      <p className="text-surface/80">
                        Subagent models for focused sessions are set per block — open the Blocks tab, expand a block,
                        and pick a model for its lane (or use primary).
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.useSubagents}
                      aria-describedby="sidebar-subagents-desc"
                      onClick={() => onSetUseSubagents(!config.useSubagents)}
                      className={`relative h-7 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                        config.useSubagents
                          ? 'border-ink bg-ink'
                          : 'border-rule bg-surface-raised'
                      }`}
                    >
                      <span className="sr-only">
                        {config.useSubagents ? 'Subagents on' : 'Subagents off'}
                      </span>
                      <span
                        className={`absolute top-1 left-1 block h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out ${
                          config.useSubagents ? 'translate-x-4' : 'translate-x-0'
                        }`}
                        aria-hidden
                      />
                    </button>
                  </div>
                  <div className="group relative flex items-center justify-between gap-3 px-3 py-2.5">
                    <div id="sidebar-build-desc" className="sr-only">
                      Focus on the product concept; let the agent propose and refine stack choices as you iterate. Off =
                      lock picks in the UI before generating prompts.
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${SIDEBAR_CARD_PRIMARY} cursor-help`}>Build as you go</p>
                    </div>
                    <div
                      role="tooltip"
                      className={SIDEBAR_HELP_TOOLTIP}
                      aria-hidden
                    >
                      Focus on the product concept; let the agent propose and refine stack choices as you iterate. Off =
                      lock picks in the UI before generating prompts.
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.buildAsYouGo}
                      aria-describedby="sidebar-build-desc"
                      onClick={() => onSetBuildAsYouGo(!config.buildAsYouGo)}
                      className={`relative h-7 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                        config.buildAsYouGo ? 'border-ink bg-ink' : 'border-rule bg-surface-raised'
                      }`}
                    >
                      <span className="sr-only">
                        {config.buildAsYouGo ? 'Build as you go on' : 'Build as you go off'}
                      </span>
                      <span
                        className={`absolute top-1 left-1 block h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out ${
                          config.buildAsYouGo ? 'translate-x-4' : 'translate-x-0'
                        }`}
                        aria-hidden
                      />
                    </button>
                  </div>
                  <div className="group relative flex items-center justify-between gap-3 px-3 py-2.5">
                    <div id="sidebar-oss-desc" className="sr-only">
                      Prefer free-to-use and open-source libraries, tools, and hosting in generated briefs. Off = no
                      extra license constraint.
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${SIDEBAR_CARD_PRIMARY} cursor-help`}>Free / OSS only</p>
                    </div>
                    <div
                      role="tooltip"
                      className={SIDEBAR_HELP_TOOLTIP}
                      aria-hidden
                    >
                      Prefer free-to-use and open-source (OSS) dependencies, tools, and deployment paths in generated
                      briefs. When off, commercial options are fine too.
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.preferOpenSourceOnly}
                      aria-describedby="sidebar-oss-desc"
                      onClick={() => onSetPreferOpenSourceOnly(!config.preferOpenSourceOnly)}
                      className={`relative h-7 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                        config.preferOpenSourceOnly
                          ? 'border-ink bg-ink'
                          : 'border-rule bg-surface-raised'
                      }`}
                    >
                      <span className="sr-only">
                        {config.preferOpenSourceOnly ? 'Free / OSS only on' : 'Free / OSS only off'}
                      </span>
                      <span
                        className={`absolute top-1 left-1 block h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out ${
                          config.preferOpenSourceOnly ? 'translate-x-4' : 'translate-x-0'
                        }`}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {activePanel === 'project' && config.projectTypeId && (
          <div className="animate-fade-in min-w-0">
            <SidebarPanelHeader
              label="Details"
              description="Name, description, and project-type fields that feed into your generated briefs."
            />
            <div className="min-w-0">
                <div className="min-w-0 w-full overflow-visible bg-surface">
                  <div className="min-w-0 px-3 py-2.5">
                    <label htmlFor="sidebar-project-name" className={SIDEBAR_FIELD_LABEL}>
                      Name
                    </label>
                    <input
                      id="sidebar-project-name"
                      type="text"
                      value={config.name}
                      onChange={(e) => onSetName(e.target.value)}
                      placeholder="Untitled"
                      className={`w-full bg-transparent ${SIDEBAR_BODY} placeholder:text-ink-faint focus:outline-none`}
                    />
                  </div>
                  <div className="min-w-0 px-3 py-2.5">
                    <label htmlFor="sidebar-project-desc" className={SIDEBAR_FIELD_LABEL}>
                      Description
                    </label>
                    <textarea
                      id="sidebar-project-desc"
                      value={config.projectDescription}
                      onChange={(e) => onSetDescription(e.target.value)}
                      placeholder="What does it do?"
                      rows={2}
                      className={`w-full bg-transparent ${SIDEBAR_BODY} placeholder:text-ink-faint focus:outline-none resize-none`}
                    />
                  </div>
                  {typeDetailFields.map((field) => (
                    <div key={field.id} className="min-w-0 px-3 py-2.5">
                      <div className={SIDEBAR_FIELD_LABEL}>{field.label}</div>
                      {field.input === 'chips' && field.options ? (
                        <div
                          className="flex flex-wrap gap-1.5 pt-0.5"
                          role="group"
                          aria-label={field.label}
                          data-chip-group
                        >
                          {field.options
                            .filter((opt) => opt.value !== '')
                            .map((opt) => {
                              const selected = (typeDetails[field.id] ?? '') === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  data-chip
                                  aria-pressed={selected}
                                  onClick={() =>
                                    onSetTypeDetail(field.id, selected ? '' : opt.value)
                                  }
                                  className={`${TYPE_DETAIL_CHIP_BASE} ${
                                    selected
                                      ? 'border-ink/30 bg-surface-raised text-ink'
                                      : 'border-rule bg-surface text-ink-secondary hover:border-neutral-300 hover:bg-surface-raised'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                        </div>
                      ) : field.input === 'select' && field.options ? (
                        <CustomSelect
                          id={`sidebar-type-detail-${field.id}`}
                          size="md"
                          variant="sidebar"
                          value={typeDetails[field.id] ?? ''}
                          onChange={(v) => onSetTypeDetail(field.id, v)}
                          options={field.options.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          }))}
                          aria-label={field.label}
                          triggerClassName="!border-rule/40 !bg-white/35 backdrop-blur-sm hover:!bg-white/50 rounded-lg"
                        />
                      ) : field.multiline ? (
                        <textarea
                          value={typeDetails[field.id] ?? ''}
                          onChange={(e) => onSetTypeDetail(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={field.rows ?? 2}
                          className={`w-full bg-transparent ${SIDEBAR_BODY} placeholder:text-ink-faint focus:outline-none resize-none`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={typeDetails[field.id] ?? ''}
                          onChange={(e) => onSetTypeDetail(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className={`w-full bg-transparent ${SIDEBAR_BODY} placeholder:text-ink-faint focus:outline-none`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        {/* ── BLOCKS (Weave-style grid + detail drawer) ── */}
        {activePanel === 'blocks' && config.projectTypeId && (
          <div className="animate-fade-in flex min-w-0 flex-col">
            <SidebarPanelHeader
              label="Blocks"
              description="Choose stack areas; expand a block to set technology, libraries, and lane models."
              count={config.selectedBlockIds.length}
            />
            <div className="shrink-0 border-b border-rule">
              <label htmlFor="sidebar-search" className="sr-only">
                Search blocks
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="sidebar-search"
                  type="search"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search blocks…"
                  className="w-full border-0 bg-transparent py-2.5 pl-9 pr-3 text-[10px] text-ink shadow-none placeholder:text-ink-faint focus:outline-none focus:ring-0 focus:bg-black/[0.03]"
                />
              </div>
            </div>
            <div className="space-y-4 pb-3 pt-2">
                {sidebarSearch.trim() &&
                includedGrouped.length === 0 &&
                recommendedFiltered.length === 0 ? (
                  <p className="px-3 py-6 text-center text-[10px] text-ink-faint">
                    No blocks match &ldquo;{sidebarSearch.trim()}&rdquo;.
                  </p>
                ) : null}

                {includedGrouped.map((group) =>
                  group.blocks.length === 0 ? null : (
                    <div key={group.layerId}>
                      <p className={`mb-2 px-3 ${SIDEBAR_SECTION_LABEL}`}>{group.label}</p>
                      <div className="flex flex-col gap-1">
                        {group.blocks.map((block) => (
                          <Fragment key={block.id}>
                            <SidebarBlockGridCard
                              block={block}
                              tier={tier}
                              config={config}
                              variant="included"
                              isExpanded={expandedBlockId === block.id}
                              onToggleExpand={() =>
                                setExpandedBlockId(expandedBlockId === block.id ? null : block.id)
                              }
                              onCornerAction={() => onToggleBlock(block.id)}
                              cornerLabel="Remove from project"
                            />
                            {renderExpandedBlockPanel(block)}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ),
                )}

                {recommendedFiltered.length > 0 ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2 px-3">
                      <p className={SIDEBAR_SECTION_LABEL}>Recommended</p>
                      <button
                        type="button"
                        onClick={() => recommendedFiltered.forEach((b) => onToggleBlock(b.id))}
                        className="text-[10px] font-bold uppercase tracking-wider text-ink-faint transition-colors hover:text-accent"
                      >
                        Add all
                      </button>
                    </div>
                    <div className="space-y-4">
                      {recommendedGrouped.map((group) =>
                        group.blocks.length === 0 ? null : (
                          <div key={`rec-${group.layerId}`}>
                            <p className={`mb-2 px-3 ${SIDEBAR_SECTION_LABEL}`}>{group.label}</p>
                            <div className="flex flex-col gap-1">
                              {group.blocks.map((block) => (
                                <Fragment key={block.id}>
                                  <SidebarBlockGridCard
                                    block={block}
                                    tier={tier}
                                    config={config}
                                    variant="recommended"
                                    isExpanded={expandedBlockId === block.id}
                                    onToggleExpand={() =>
                                      setExpandedBlockId(expandedBlockId === block.id ? null : block.id)
                                    }
                                    onCornerAction={() => onToggleBlock(block.id)}
                                    cornerLabel={`Add ${block.name} to project`}
                                  />
                                  {renderExpandedBlockPanel(block)}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
        )}

        {/* Tech Stack section removed — tech choices are inline in each block's expanded view */}

        {activePanel === 'resources' && config.projectTypeId && (
          <div className="animate-fade-in flex min-w-0 flex-col">
            <SidebarPanelHeader
              label="Resources"
              description="Add links or small files—specs, mockups, or references—so this tech pack stays grounded in your real artifacts."
              count={(config.resources ?? []).length}
            />
            <div className="min-w-0 max-w-full px-3 pb-4 pt-2">
              <ResourcesPanel
                variant="sidebar"
                resources={config.resources ?? []}
                onAddUrl={onAddResourceUrl}
                onAddFile={onAddResourceFile}
                onRemove={onRemoveResource}
              />
            </div>
          </div>
        )}

        {activePanel === 'integrations' && config.projectTypeId && visibleIntegrations.length > 0 && (
              <div className="animate-fade-in flex min-w-0 flex-col">
                <SidebarPanelHeader
                  label="Integrations"
                  description="Suggested for your project type and description. Skills align with the skills.sh ecosystem."
                  count={config.selectedIntegrationIds.length}
                />
                <div className="space-y-2 px-3 pb-4 pt-2">
                <div className="overflow-hidden rounded-lg bg-white">
                  <div
                    role="tablist"
                    aria-label="Integration categories"
                    className="flex border-b border-rule bg-white"
                  >
                    {INTEGRATION_CATEGORY_ORDER.map((cat) => {
                      const items = integrationsByCategory.get(cat) ?? [];
                      if (items.length === 0) return null;
                      const selectedHere = items.filter((i) =>
                        config.selectedIntegrationIds.includes(i.id),
                      ).length;
                      const isActive = integrationTab === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          id={`integration-tab-${cat}`}
                          aria-controls={`integration-panel-${cat}`}
                          onClick={() => setIntegrationTab(cat)}
                          className={`flex-1 min-w-0 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] leading-tight transition-colors border-b -mb-px ${
                            isActive
                              ? 'text-ink border-ink bg-surface'
                              : 'text-ink-muted border-transparent hover:text-ink-secondary hover:bg-surface/80'
                          }`}
                        >
                          <span className="block truncate text-center font-sans text-[10px]">
                            {INTEGRATION_CATEGORY_LABELS[cat]}
                            {selectedHere > 0 ? (
                              <span className="font-mono font-normal text-[10px] normal-case tracking-normal text-accent">
                                {' '}
                                {selectedHere}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    role="tabpanel"
                    id={`integration-panel-${integrationTab}`}
                    aria-labelledby={`integration-tab-${integrationTab}`}
                    className="flex flex-col gap-1 px-2 py-2"
                  >
                    {(integrationsByCategory.get(integrationTab) ?? []).map((item) => {
                      const isChosen = config.selectedIntegrationIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={isChosen}
                          onClick={() => onToggleIntegration(item.id)}
                          className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                            isChosen ? 'bg-surface-raised' : 'hover:bg-black/[0.04]'
                          }`}
                        >
                          <IntegrationBrandIcon
                            integrationId={item.id}
                            name={item.name}
                            category={item.category}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={SIDEBAR_CARD_PRIMARY}>{item.name}</p>
                            <p className="mt-0.5 text-[10px] leading-snug text-ink-muted line-clamp-2">
                              {item.description}
                            </p>
                            {item.installHint ? (
                              <p className="mt-1 font-mono text-[10px] leading-tight text-ink-faint line-clamp-1">
                                {item.installHint}
                              </p>
                            ) : null}
                          </div>
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                              isChosen
                                ? 'bg-surface-raised text-ink'
                                : 'bg-transparent text-ink-muted group-hover:bg-surface-raised'
                            }`}
                            aria-hidden="true"
                          >
                            {isChosen ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              </div>
        )}
          </div>
        </div>
      </div>
      </div>

    </aside>
  );
}

function BlockSubagentModelRow({
  lane,
  blockId,
  config,
  models,
  primaryModelMeta,
  onSetSubagentModel,
}: {
  lane: SubagentLane | undefined;
  blockId: string;
  config: ProjectConfig;
  models: ModelRecommendation[];
  primaryModelMeta: ModelRecommendation | undefined;
  onSetSubagentModel: (laneId: string, modelId: string) => void;
}) {
  if (!lane) return null;
  const selectId = `subagent-model-${lane.id}-${blockId}`;
  return (
    <div className="border-t border-rule">
      <div className="px-2.5 py-1.5">
        <span className={`block ${SIDEBAR_LABEL}`}>Subagent model — {lane.label}</span>
      </div>
      <div className="px-2.5 pb-2.5">
        <p className="mb-1.5 text-[10px] font-normal leading-snug text-ink-muted">
          For a focused session on this block, use this lane and optional model override. Shared with other blocks in the same lane.
        </p>
        <p className="mb-1.5 text-[10px] font-normal leading-snug text-ink-faint">{lane.hint}</p>
        <CustomSelect
          id={selectId}
          size="sm"
          value={config.subagentModels?.[lane.id] ?? ''}
          onChange={(v) => onSetSubagentModel(lane.id, v)}
          disabled={models.length === 0}
          onTriggerPointerDown={(e) => e.stopPropagation()}
          placeholder="Same as primary"
          options={[
            {
              value: '',
              label: `Same as primary${primaryModelMeta ? ` (${primaryModelMeta.name})` : ''}`,
            },
            ...models.map((m) => ({
              value: m.id,
              label: `${m.name} (${m.provider})`,
            })),
          ]}
          aria-label={`Subagent model for ${lane.label}`}
        />
      </div>
    </div>
  );
}

function IncludedBlockExpandedPanel({
  block,
  config,
  models,
  primaryModelMeta,
  onSetTechChoice,
  onToggleLibrary,
  onSetSubagentModel,
}: {
  block: Block;
  config: ProjectConfig;
  models: ModelRecommendation[];
  primaryModelMeta: ModelRecommendation | undefined;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
  onSetSubagentModel: (laneId: string, modelId: string) => void;
}) {
  return (
    <div className="border-t border-rule bg-surface-raised animate-fade-in">
      <div className="px-2.5 py-2.5 space-y-2">
        <p className="text-[10px] font-normal text-ink-secondary leading-relaxed">{block.explanation}</p>
        <div>
          <p className={`mb-0.5 ${SIDEBAR_LABEL}`}>Why</p>
          <p className="text-[10px] font-normal text-ink-secondary leading-relaxed">{block.whyNeeded}</p>
        </div>
      </div>
      {config.useSubagents ? (
        <BlockSubagentModelRow
          lane={getSubagentLaneForBlock(block.id)}
          blockId={block.id}
          config={config}
          models={models}
          primaryModelMeta={primaryModelMeta}
          onSetSubagentModel={onSetSubagentModel}
        />
      ) : null}
      {block.techOptionIds.length > 0 && (() => {
        const options = techOptions.filter((o) => block.techOptionIds.includes(o.id));
        const chosenId = config.techChoices[block.id];
        return (
          <div className="border-t border-rule">
            <div className="px-2.5 py-1.5">
              <span className={`block ${SIDEBAR_LABEL}`}>Technology</span>
            </div>
            {options.map((option) => {
              const isChosen = chosenId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetTechChoice(block.id, option.id);
                  }}
                  className={`w-full flex items-start gap-2 px-2.5 py-1.5 text-left transition-colors ${
                    isChosen ? 'bg-surface' : 'hover:bg-surface'
                  }`}
                >
                  <div className={`mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    isChosen ? 'border-ink bg-ink' : 'border-ink-faint'
                  }`}>
                    {isChosen && <div className="h-1 w-1 rounded-full bg-surface" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold ${isChosen ? 'text-ink' : 'text-ink-secondary'}`}>
                        {option.name}
                      </span>
                      {option.isDefault && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">Default</span>
                      )}
                    </div>
                    <p className={`text-[10px] leading-snug mt-0.5 line-clamp-2 ${
                      isChosen ? 'text-ink-muted' : 'text-ink-faint'
                    }`}>{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}
      {(block.libraryIds?.length ?? 0) > 0 && (() => {
        const libs = blockLibraries.filter((l) => block.libraryIds!.includes(l.id));
        const categories = [...new Set(libs.map((l) => l.category))];
        return (
          <div className="border-t border-rule">
            <div className="px-2.5 py-1.5">
              <span className={`block ${SIDEBAR_LABEL}`}>Libraries</span>
            </div>
            <div className="space-y-3 px-2.5 pb-2">
              {categories.map((cat) => (
                <div key={cat}>
                  <p className={`mb-1.5 ${SIDEBAR_LABEL}`}>{cat}</p>
                  <div className="flex flex-col gap-1">
                    {libs.filter((l) => l.category === cat).map((lib) => (
                      <LibraryChip
                        key={lib.id}
                        lib={lib}
                        isActive={config.selectedLibraryIds.includes(lib.id)}
                        onToggle={() => onToggleLibrary(lib.id)}
                        size="sm"
                        variant="list"
                        idPrefix={`sidebar-${block.id}`}
                        stopPropagationOnClick
                        tooltipPlacement="below"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

