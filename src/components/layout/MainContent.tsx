import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Block, ProjectConfig, TechOption, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import { blockLibraries } from '../../data/libraries';
import { modelRecommendations } from '../../data/models';
import { getSubagentLaneForBlock } from '../../data/blockSubagentLane';
import { groupVisibleBlocksByStackLayer } from '../../data/stackLayers';
import { generatePrompt } from '../../utils/promptGenerator';
import { ArchitectureFlowCanvas } from '../architecture/ArchitectureFlowCanvas';
import { BlockOcticon } from '../icons/OcticonById';
import { ComplexityDots } from '../ui/ComplexityDots';
import { LibraryChip } from '../ui/LibraryChip';
import { IntegrationChip } from '../ui/IntegrationChip';
import { CustomSelect } from '../ui/CustomSelect';
import {
  getVisibleIntegrations,
  INTEGRATION_CATEGORY_LABELS,
  INTEGRATION_CATEGORY_ORDER,
  type IntegrationCategory,
  type IntegrationItem,
} from '../../data/integrations';

/** Set `true` to show octicons beside each row in the Stack tab. */
const SHOW_STACK_BLOCK_ICONS = false;

/** What / Why explainer tabs in expanded stack rows (feature-flagged off for now). */
const SHOW_STACK_BLOCK_EXPLAINER = false;

type StackAddonTab = IntegrationCategory | 'packages';

function stackAddonTabLabel(tab: StackAddonTab): string {
  if (tab === 'packages') return 'Packages';
  return INTEGRATION_CATEGORY_LABELS[tab];
}

function computeDefaultAddonTab(
  block: Block,
  integrationsByCategory: Map<IntegrationCategory, IntegrationItem[]>,
): StackAddonTab {
  if ((block.libraryIds?.length ?? 0) > 0) return 'packages';
  for (const cat of INTEGRATION_CATEGORY_ORDER) {
    if ((integrationsByCategory.get(cat) ?? []).length > 0) return cat;
  }
  return 'packages';
}

function stackRowHasAddons(
  block: Block,
  integrationsByCategory: Map<IntegrationCategory, IntegrationItem[]>,
): boolean {
  if ((block.libraryIds?.length ?? 0) > 0) return true;
  return INTEGRATION_CATEGORY_ORDER.some(
    (c) => (integrationsByCategory.get(c) ?? []).length > 0,
  );
}

/** Small leading icon for package library category headings (matches data/libraries category strings). */
function LibraryCategoryLeadingIcon({ category }: { category: string }) {
  const cls = 'h-3.5 w-3.5 shrink-0 text-ink-muted';
  const c = category.trim().toLowerCase();

  if (c.includes('icon')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    );
  }
  if (c.includes('animation')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    );
  }
  if (c.includes('ui component') || c === 'ui') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    );
  }
  if (c.includes('font')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    );
  }
  if (c.includes('form')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6 12.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm2.25 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm2.25 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"
        />
      </svg>
    );
  }
  if (c.includes('fetch')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-.7M4.031 9.865v4.992m0 0h4.992m-4.993-4.992L7.16 6.68a8.25 8.25 0 0113.803 3.7M19.969 14.152V9.16m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-13.803 3.7"
        />
      </svg>
    );
  }
  if (c.includes('data display') || c.includes('display')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    );
  }
  if (c.includes('interaction')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.182l-1.086 1.086m-10.476 0l-1.087-1.086M12 19.5v-2.25m5.834.182l-1.087-1.087m-10.475 0l-1.086 1.087M4.125 4.125h2.25v2.25H4.125v-2.25zm0 13.5h2.25v2.25H4.125v-2.25zm13.5-13.5h2.25v2.25h-2.25v-2.25zm0 13.5h2.25v2.25h-2.25v-2.25z"
        />
      </svg>
    );
  }
  if (c.includes('utilit')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 010-3.586L11 3.25a2.548 2.548 0 013.586 0l5.653 4.655a2.548 2.548 0 010 3.586l-1.757 2.128M9.06 9.06l.3-.3a1.07 1.07 0 011.47 0l.3.3a1.07 1.07 0 010 1.47l-.735.735a1.07 1.07 0 01-1.47 0l-.3-.3a1.07 1.07 0 010-1.47l.735-.735z"
        />
      </svg>
    );
  }
  if (c.includes('feedback')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.712 16.414 3.25 14.153 3.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

function StackOptionalAddonsPanel({
  block,
  config,
  addonTab,
  setAddonTab,
  integrationsByCategory,
  onToggleLibrary,
  onToggleIntegration,
}: {
  block: Block;
  config: ProjectConfig;
  addonTab: StackAddonTab;
  setAddonTab: (t: StackAddonTab) => void;
  integrationsByCategory: Map<IntegrationCategory, IntegrationItem[]>;
  onToggleLibrary: (id: string) => void;
  onToggleIntegration: (id: string) => void;
}) {
  const libs =
    (block.libraryIds?.length ?? 0) > 0
      ? blockLibraries.filter((l) => block.libraryIds!.includes(l.id))
      : [];

  const visibleIntegrationTabs = INTEGRATION_CATEGORY_ORDER.filter(
    (c) => (integrationsByCategory.get(c) ?? []).length > 0,
  );
  const hasPackages = libs.length > 0;
  const visibleTabs: StackAddonTab[] = [
    ...visibleIntegrationTabs,
    ...(hasPackages ? (['packages'] as const) : []),
  ];

  if (visibleTabs.length === 0) return null;

  const activeTab = visibleTabs.includes(addonTab) ? addonTab : visibleTabs[0]!;

  const selectedInTab = (tab: StackAddonTab): number => {
    if (tab === 'packages') {
      return libs.filter((l) => config.selectedLibraryIds.includes(l.id)).length;
    }
    const list = integrationsByCategory.get(tab as IntegrationCategory) ?? [];
    return list.filter((i) => config.selectedIntegrationIds.includes(i.id)).length;
  };

  const libCategories = [...new Set(libs.map((l) => l.category))];
  const integrationItems: IntegrationItem[] =
    activeTab === 'packages' ? [] : integrationsByCategory.get(activeTab as IntegrationCategory) ?? [];

  return (
    <div className="border-t border-rule bg-white">
      <div className="px-5 py-5">
        <p className="mb-1.5 text-[10px] font-mono font-medium uppercase tracking-[0.08em] text-ink-secondary">
          Optional skills & add-ons
        </p>
        <p className="mb-4 text-[10px] leading-relaxed text-ink-muted">
          Skills, MCPs, APIs, and catalog libraries match the Integrations sidebar. Packages are tied to this
          block. All toggles stay in sync with your prompt.
        </p>

        {visibleTabs.length > 1 ? (
          <div className="-mx-5 mb-4 overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div role="tablist" aria-label="Add-on categories" className="flex w-max min-w-full max-w-full flex-wrap gap-1.5">
              {visibleTabs.map((tab) => {
                const n = selectedInTab(tab);
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    id={`stack-addon-tab-${block.id}-${tab}`}
                    aria-controls={`stack-addon-panel-${block.id}`}
                    onClick={() => setAddonTab(tab)}
                    className={`min-w-0 shrink-0 rounded-lg border px-3 py-2 text-left text-xs font-semibold leading-tight tracking-tight transition-colors focus:outline-none focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isActive
                        ? 'border-ink/20 bg-surface-raised text-ink shadow-sm'
                        : 'border-rule bg-white text-ink-muted hover:bg-black/[0.03] hover:text-ink-secondary'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span>{stackAddonTabLabel(tab)}</span>
                      {n > 0 ? (
                        <span
                          className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                            isActive
                              ? 'border-ink/15 bg-white text-ink'
                              : 'border-transparent bg-surface-raised text-ink-muted'
                          }`}
                        >
                          {n}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div
          role="tabpanel"
          id={`stack-addon-panel-${block.id}`}
          aria-label={
            visibleTabs.length > 1
              ? undefined
              : `${stackAddonTabLabel(activeTab)} for this block`
          }
          aria-labelledby={
            visibleTabs.length > 1 ? `stack-addon-tab-${block.id}-${activeTab}` : undefined
          }
          className="overflow-visible"
        >
          {activeTab === 'packages' ? (
            <div className="space-y-3">
              {libCategories.map((cat) => (
                <div key={cat}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-mono font-medium uppercase tracking-[0.08em] text-ink-secondary">
                    <LibraryCategoryLeadingIcon category={cat} />
                    {cat}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {libs
                      .filter((l) => l.category === cat)
                      .map((lib) => (
                        <LibraryChip
                          key={lib.id}
                          lib={lib}
                          isActive={config.selectedLibraryIds.includes(lib.id)}
                          onToggle={() => onToggleLibrary(lib.id)}
                          size="md"
                          variant="list"
                          listTooltipMode="stack"
                          idPrefix={`stack-${block.id}`}
                          tooltipPlacement="below"
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {integrationItems.map((item) => (
                <IntegrationChip
                  key={item.id}
                  item={item}
                  isActive={config.selectedIntegrationIds.includes(item.id)}
                  onToggle={() => onToggleIntegration(item.id)}
                  idPrefix={`stack-${block.id}`}
                  tooltipPlacement="below"
                  variant="list"
                  listTooltipMode="stack"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MainContentProps {
  config: ProjectConfig;
  tier: Tier;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
  onToggleIntegration: (integrationId: string) => void;
  onSetProjectType: (typeId: string) => void;
}

export function MainContent({
  config,
  tier,
  onToggleBlock,
  onSetTechChoice,
  onToggleLibrary,
  onToggleIntegration,
  onSetProjectType,
}: MainContentProps) {
  const [copied, setCopied] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [stackAddonTab, setStackAddonTab] = useState<StackAddonTab>('packages');
  const [mainTab, setMainTab] = useState<'architecture' | 'map' | 'prompt'>('architecture');
  const [comparingBlockId, setComparingBlockId] = useState<string | null>(null);
  const [hiddenStackLayers, setHiddenStackLayers] = useState<Set<string>>(() => new Set());

  const toggleStackLayerVisibility = useCallback((layerId: string) => {
    setHiddenStackLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  const prompt = useMemo(() => {
    if (!config.projectTypeId) return '';
    return generatePrompt(config, tier);
  }, [config, tier]);

  const stackWorkspaceEyebrow = useMemo(() => {
    const name = config.name.trim() || 'Untitled';
    const typeName = projectTypes.find((t) => t.id === config.projectTypeId)?.name ?? 'Project';
    return `${name} · ${typeName}`;
  }, [config.name, config.projectTypeId]);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!config.projectTypeId) {
    return (
      <div className="flex-1 min-w-0 w-full overflow-y-auto bg-surface">
        <div className="max-w-7xl 2xl:max-w-[90rem] mx-auto px-8 sm:px-10 lg:px-12 py-12 animate-fade-in">
          <p className="struct-label mb-2">Tech pack · project type</p>
          <h1 className="text-[32px] sm:text-[44px] font-semibold text-ink leading-[1.08] tracking-[-0.03em] mb-2">
            What are you building?
          </h1>
          <p className="text-sm text-ink-muted mb-8">
            Select a project type to get started.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 bg-transparent">
            {projectTypes.map((type) => {
              const typeBlocks = blocks.filter((b) => {
                const s = b.statusForTier(type.tier);
                return s === 'required' || s === 'recommended';
              });

              return (
                <button
                  key={type.id}
                  onClick={() => onSetProjectType(type.id)}
                  className="text-left p-5 bg-surface/70 backdrop-blur-[1px] border border-rule-strong hover:bg-white/80 hover:border-ink/15 transition-[border,background] group"
                >
                  <div aria-hidden className="mb-3 flex items-center">
                    <ComplexityDots filled={type.tier} size="dot" />
                  </div>
                  <h3 className="text-[15px] font-medium text-ink tracking-tight mb-1 group-hover:text-accent transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-[10px] text-ink-muted leading-snug mb-3">
                    {type.tagline}
                  </p>

                  <div className="h-px bg-rule/30 mb-3" />

                  <p className="text-[10px] text-ink-secondary leading-relaxed line-clamp-3 mb-3">
                    {type.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                    <span className="font-semibold tabular-nums">{typeBlocks.length}</span>
                    <span>blocks</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const visibleBlocks = useMemo(
    () =>
      blocks
        .filter((b) => b.statusForTier(tier) !== 'hidden')
        .sort((a, b) => {
          const order = { required: 0, recommended: 1, optional: 2, hidden: 3 };
          return order[a.statusForTier(tier)] - order[b.statusForTier(tier)];
        }),
    [tier]
  );

  const stackGroups = useMemo(
    () => groupVisibleBlocksByStackLayer(visibleBlocks),
    [visibleBlocks]
  );

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
    if (!expandedBlockId) return;
    const block = blocks.find((b) => b.id === expandedBlockId);
    if (!block) return;
    setStackAddonTab(computeDefaultAddonTab(block, integrationsByCategory));
  }, [expandedBlockId, integrationsByCategory]);

  const tabSurfaceClass = mainTab === 'map' ? 'geist-grid geist-grid--map' : 'bg-surface-raised';

  const stackOrPromptTabPanelPad =
    'px-6 pb-5 pt-16 sm:px-10 sm:pb-6 sm:pt-[4.5rem] lg:px-12 lg:pb-8';

  return (
    <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-surface">
      <div className="flex-1 min-h-0 flex flex-col">
        <div className={`border-b border-rule flex flex-1 min-h-0 flex-col ${tabSurfaceClass}`}>
          {/* Single shared content region for Stack, Map, and Prompt */}
          <div
            role="tabpanel"
            id={`main-tab-panel-${mainTab}`}
            aria-labelledby={`main-tab-${mainTab}`}
            className={`flex-1 min-h-0 relative min-w-0 flex flex-col ${
              mainTab === 'map'
                ? 'overflow-hidden pt-16 sm:pt-[4.5rem]'
                : mainTab === 'architecture'
                  ? `${stackOrPromptTabPanelPad} overflow-y-auto`
                  : `${stackOrPromptTabPanelPad} overflow-hidden`
            }`}
          >
            {mainTab === 'architecture' && (
              <div className="mx-auto min-w-0 w-full max-w-[52rem] px-0 py-4 sm:py-5">
                  <header className="shrink-0 pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p
                          className="struct-label truncate min-w-0 max-w-full"
                          title={stackWorkspaceEyebrow}
                        >
                          {stackWorkspaceEyebrow}
                        </p>
                        <h2 className="text-[clamp(1.625rem,3.5vw,2.125rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-ink">
                          Project Stack
                        </h2>
                      </div>
                      <div className="shrink-0 font-mono text-[10px] tabular-nums uppercase tracking-[0.06em] text-ink-muted">
                        {stackGroups.length}{' '}
                        {stackGroups.length === 1 ? 'layer' : 'layers'} · {visibleBlocks.length}{' '}
                        {visibleBlocks.length === 1 ? 'block' : 'blocks'}
                      </div>
                    </div>
                    <p className="mt-4 max-w-2xl text-[10px] leading-relaxed text-ink-muted">
                      Same layer order as the Map. Expand a row to set technology; collapse a layer header to hide
                      its blocks.
                    </p>
                  </header>

                  <div className="mt-5 flex min-w-0 flex-col gap-2">
                {stackGroups.map((group) => {
                  const isCollapsed = hiddenStackLayers.has(group.layerId);
                  const panelId = `stack-section-${group.layerId}`;
                  const headId = `stack-section-head-${group.layerId}`;
                  return (
                    <section
                      key={group.layerId}
                      className="min-w-0 shrink-0 divide-y divide-rule overflow-visible rounded-lg border border-rule bg-surface/95"
                    >
                      <button
                        type="button"
                        onClick={() => toggleStackLayerVisibility(group.layerId)}
                        className="flex w-full items-center justify-between gap-3 bg-surface-raised/40 px-4 py-2.5 text-left transition-colors hover:bg-surface-raised/90"
                        aria-expanded={!isCollapsed}
                        aria-controls={panelId}
                        id={headId}
                      >
                        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink">
                            {group.label}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-ink-muted">
                            {group.blocks.length} block{group.blocks.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <span className="shrink-0 flex items-center">
                          <svg
                            className={`h-3.5 w-3.5 text-ink-muted transition-transform shrink-0 ${
                              isCollapsed ? '' : 'rotate-180'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>
                      {!isCollapsed && (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={headId}
                          className="divide-y divide-rule"
                        >
                          {group.blocks.map((block) => (
                            <StackBlockRow
                              key={block.id}
                              block={block}
                              tier={tier}
                              config={config}
                              expandedBlockId={expandedBlockId}
                              setExpandedBlockId={setExpandedBlockId}
                              comparingBlockId={comparingBlockId}
                              setComparingBlockId={setComparingBlockId}
                              onToggleBlock={onToggleBlock}
                              onSetTechChoice={onSetTechChoice}
                              onToggleLibrary={onToggleLibrary}
                              onToggleIntegration={onToggleIntegration}
                              integrationsByCategory={integrationsByCategory}
                              stackAddonTab={stackAddonTab}
                              setStackAddonTab={setStackAddonTab}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
                  </div>
              </div>
            )}

            {mainTab === 'map' && (
              <ArchitectureFlowCanvas
                visibleBlocks={visibleBlocks}
                config={config}
                tier={tier}
                expandedBlockId={expandedBlockId}
                onExpandToggle={setExpandedBlockId}
                onToggleBlock={onToggleBlock}
                onSetTechChoice={onSetTechChoice}
              />
            )}

            {mainTab === 'prompt' && (
              <div className="flex-1 min-h-0 flex flex-col border border-dashed border-rule-strong bg-surface rounded-sm overflow-hidden outline outline-1 outline-dotted outline-black/[0.06]">
                <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-dashed border-rule bg-surface-raised/60">
                  <span className="text-[10px] font-mono font-medium text-ink-muted uppercase tracking-[0.12em] tabular-nums">
                    {prompt.length > 0
                      ? `${prompt.length.toLocaleString()} characters`
                      : 'No prompt yet'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!prompt}
                    className="text-[10px] font-bold text-ink uppercase tracking-wider border border-dashed border-rule-strong px-3 py-1 hover:bg-surface-raised transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="flex-1 min-h-0 overflow-auto p-5 text-[10px] text-ink-secondary font-mono leading-[1.7] whitespace-pre-wrap">
                  {prompt || 'Configure your project to generate a prompt.'}
                </pre>
              </div>
            )}

            <div
              className={`pointer-events-none absolute top-4 z-40 flex justify-center sm:top-5 ${
                mainTab === 'map' ? 'inset-x-3 sm:inset-x-4' : 'inset-x-6 sm:inset-x-10 lg:inset-x-12'
              }`}
            >
              <nav
                className="pointer-events-auto ui-chrome-floating flex max-w-full items-center overflow-hidden rounded-full bg-white/92 backdrop-blur-md"
                role="tablist"
                aria-label="Workspace"
              >
                {(
                  [
                    { id: 'architecture' as const, label: 'Stack' },
                    { id: 'map' as const, label: 'Map' },
                    { id: 'prompt' as const, label: 'Prompt' },
                  ] as const
                ).map((tab, i) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={mainTab === tab.id}
                    id={`main-tab-${tab.id}`}
                    onClick={() => setMainTab(tab.id)}
                    className={`min-w-0 shrink px-3 py-1 text-[8px] font-medium tracking-tight transition-colors sm:px-4 sm:py-1 ${
                      i > 0 ? 'border-l border-rule' : ''
                    } ${
                      mainTab === tab.id
                        ? 'bg-ink text-surface'
                        : 'text-ink-muted hover:text-ink bg-white/50 hover:bg-white/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StackBlockRow({
  block,
  tier,
  config,
  expandedBlockId,
  setExpandedBlockId,
  comparingBlockId,
  setComparingBlockId,
  onToggleBlock,
  onSetTechChoice,
  onToggleLibrary,
  onToggleIntegration,
  integrationsByCategory,
  stackAddonTab,
  setStackAddonTab,
}: {
  block: Block;
  tier: Tier;
  config: ProjectConfig;
  expandedBlockId: string | null;
  setExpandedBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  comparingBlockId: string | null;
  setComparingBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
  onToggleIntegration: (integrationId: string) => void;
  integrationsByCategory: Map<IntegrationCategory, IntegrationItem[]>;
  stackAddonTab: StackAddonTab;
  setStackAddonTab: (t: StackAddonTab) => void;
}) {
  const isSelected = config.selectedBlockIds.includes(block.id);
  const isRequired = block.statusForTier(tier) === 'required';
  const isExpanded = expandedBlockId === block.id;
  const chosenOptionId = config.techChoices[block.id];
  const chosenOption = techOptions.find((o) => o.id === chosenOptionId);
  const blockOptions = techOptions.filter((o) => o.blockId === block.id);
  const isComparing = comparingBlockId === block.id;
  const [explainerTab, setExplainerTab] = useState<'what' | 'why'>('what');

  return (
    <div
      className={`transition-colors ${!isSelected && !isRequired ? 'opacity-60' : ''}`}
    >
      <div className="flex min-h-[3.75rem] items-center gap-2 px-5 py-3.5 transition-colors hover:bg-surface-raised">
        {SHOW_STACK_BLOCK_ICONS ? (
          <span className="flex shrink-0 items-center justify-center text-ink-muted" aria-hidden>
            <BlockOcticon blockId={block.id} size={18} />
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
          className="flex-1 min-w-0 text-left"
        >
          <span
            className={`block pt-0.5 text-[18px] font-medium tracking-tight ${
              isSelected || isRequired ? 'text-ink' : 'text-neutral-400'
            }`}
          >
            {block.name}
          </span>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-ink-muted">
            {block.summary}
          </p>
        </button>

        {isSelected && chosenOption && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <TechChoiceChip option={chosenOption} instanceId={block.id} />
            {config.useSubagents ? <ModelChoiceChip blockId={block.id} config={config} /> : null}
          </div>
        )}

        {!isRequired && !isSelected ? (
          <button
            type="button"
            onClick={() => onToggleBlock(block.id)}
            className="shrink-0 h-5 w-5 flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
            aria-label="Add to project"
            title="Add"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
            className="shrink-0 h-5 w-5 flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
            aria-expanded={isExpanded}
            aria-label="Expand details"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && isSelected && (
        <div className="animate-fade-in bg-white">
          <div
            className={`flex flex-col divide-y divide-rule bg-white lg:flex-row lg:divide-y-0 ${
              SHOW_STACK_BLOCK_EXPLAINER ? 'lg:divide-x' : ''
            }`}
          >
            {SHOW_STACK_BLOCK_EXPLAINER ? (
              <div className="order-1 min-w-0 flex-1 lg:order-2">
                <div className="px-5 pb-5 pt-4">
                  <div
                    role="tablist"
                    aria-label="Block context"
                    className="flex min-w-0 gap-1 border-b border-rule"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={explainerTab === 'what'}
                      id={`stack-explainer-what-${block.id}`}
                      aria-controls={`stack-explainer-panel-${block.id}`}
                      onClick={() => setExplainerTab('what')}
                      className={`relative -mb-px min-w-0 shrink-0 border-b-2 px-2 py-2 text-left text-[11px] font-semibold leading-none tracking-tight transition-[color,border-color] focus:outline-none focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-2.5 ${
                        explainerTab === 'what'
                          ? 'border-ink text-ink'
                          : 'border-transparent text-ink-muted hover:border-ink/25 hover:text-ink-secondary'
                      }`}
                    >
                      What is this
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={explainerTab === 'why'}
                      id={`stack-explainer-why-${block.id}`}
                      aria-controls={`stack-explainer-panel-${block.id}`}
                      onClick={() => setExplainerTab('why')}
                      className={`relative -mb-px min-w-0 shrink-0 border-b-2 px-2 py-2 text-left text-[11px] font-semibold leading-none tracking-tight transition-[color,border-color] focus:outline-none focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-2.5 ${
                        explainerTab === 'why'
                          ? 'border-ink text-ink'
                          : 'border-transparent text-ink-muted hover:border-ink/25 hover:text-ink-secondary'
                      }`}
                    >
                      Why
                    </button>
                  </div>
                  <div
                    role="tabpanel"
                    id={`stack-explainer-panel-${block.id}`}
                    aria-labelledby={
                      explainerTab === 'what'
                        ? `stack-explainer-what-${block.id}`
                        : `stack-explainer-why-${block.id}`
                    }
                    className="mt-3"
                  >
                    <p className="text-[10px] leading-relaxed text-ink-secondary">
                      {explainerTab === 'what' ? block.explanation : block.whyNeeded}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {blockOptions.length > 0 ? (
              <div className="order-2 min-w-0 flex-1 px-5 py-5 lg:order-1 lg:min-w-0">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8 lg:items-start">
                  <div className="min-w-0">
                    <p
                      className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-secondary"
                      id={`stack-tech-label-${block.id}`}
                    >
                      Technology
                    </p>

                    <CustomSelect
                      id={`stack-tech-select-${block.id}`}
                      value={chosenOptionId && blockOptions.some((o) => o.id === chosenOptionId) ? chosenOptionId : ''}
                      onChange={(v) => onSetTechChoice(block.id, v)}
                      options={blockOptions.map((o) => ({
                        value: o.id,
                        label: o.name,
                        tag: o.isDefault ? 'default' : undefined,
                        description: o.description,
                      }))}
                      placeholder="Select technology…"
                      size="md"
                      variant="sidebar"
                      aria-labelledby={`stack-tech-label-${block.id}`}
                      className="w-full"
                      listClassName="max-h-[min(22rem,55vh)]"
                      triggerClassName="!border-rule/40 !bg-white/80 backdrop-blur-sm hover:!bg-white rounded-lg !py-2.5 !min-h-[44px]"
                      listFooter={({ close }) => (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setComparingBlockId(isComparing ? null : block.id);
                            close();
                          }}
                          className="flex w-full items-center justify-center gap-1 rounded-sm px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-ink-muted transition-colors hover:bg-white hover:text-ink"
                        >
                          <svg
                            className="h-2.5 w-2.5 shrink-0 opacity-70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
                            />
                          </svg>
                          {isComparing ? 'Hide comparison' : 'Help me decide'}
                        </button>
                      )}
                    />
                  </div>

                  <div className="min-w-0 lg:border-l lg:border-rule lg:pl-8">
                    {chosenOption && !isComparing ? (
                      chosenOption.pros.length > 0 ? (
                        <>
                          <p
                            className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-secondary"
                            id={`stack-why-tool-label-${block.id}`}
                          >
                            Why this tool
                          </p>
                          <ul
                            className="list-disc space-y-1 pl-4 text-[10px] leading-snug text-green-900 marker:text-green-800"
                            aria-labelledby={`stack-why-tool-label-${block.id}`}
                          >
                            {chosenOption.pros.map((pro, i) => (
                              <li key={i}>{pro}</li>
                            ))}
                          </ul>
                        </>
                      ) : null
                    ) : isComparing ? (
                      <p className="text-[10px] leading-relaxed text-ink-faint lg:pt-1">
                        Compare options in the list below, then pick one from the Technology menu.
                      </p>
                    ) : (
                      <p className="text-[10px] leading-relaxed text-ink-faint lg:pt-1">
                        Select a technology — full descriptions are in the menu; tags show here when available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {blockOptions.length > 0 && isComparing ? (
            <div className="animate-fade-in border-t border-rule bg-white">
              {blockOptions.map((option) => {
                const isChosen = chosenOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSetTechChoice(block.id, option.id)}
                    className={`w-full border-b border-rule px-5 py-3 text-left transition-colors last:border-b-0 ${
                      isChosen ? 'bg-surface' : 'hover:bg-surface-raised'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <div
                        className={`flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isChosen ? 'border-ink bg-ink' : 'border-neutral-300'
                        }`}
                      >
                        {isChosen ? <span className="h-1 w-1 rounded-full bg-white" /> : null}
                      </div>
                      <span
                        className={`text-[8px] font-semibold ${
                          isChosen ? 'text-ink' : 'text-ink-secondary'
                        }`}
                      >
                        {option.name}
                      </span>
                      {option.isDefault ? (
                        <span className="text-[8px] font-medium uppercase tracking-wide text-accent">Default</span>
                      ) : null}
                    </div>
                    <p className="mb-1.5 ml-[18px] text-[10px] leading-relaxed text-ink-muted">{option.description}</p>
                    <div className="ml-[18px] flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
                      {option.pros.length > 0 ? (
                        <ul className="list-disc space-y-0.5 pl-3.5 text-[10px] leading-snug text-green-900 marker:text-green-800">
                          {option.pros.map((pro, i) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      ) : null}
                      {option.cons.length > 0 ? (
                        <ul className="list-disc space-y-0.5 pl-3.5 text-[10px] leading-snug text-neutral-600 marker:text-neutral-400">
                          {option.cons.map((con, i) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {stackRowHasAddons(block, integrationsByCategory) ? (
            <StackOptionalAddonsPanel
              block={block}
              config={config}
              addonTab={stackAddonTab}
              setAddonTab={setStackAddonTab}
              integrationsByCategory={integrationsByCategory}
              onToggleLibrary={onToggleLibrary}
              onToggleIntegration={onToggleIntegration}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function getEffectiveModelForStackBlock(blockId: string, config: ProjectConfig) {
  const lane = getSubagentLaneForBlock(blockId);
  const overrideId = lane ? (config.subagentModels?.[lane.id] ?? '').trim() : '';
  const modelId = overrideId || config.selectedModelId;
  if (!modelId) return null;
  const model = modelRecommendations.find((m) => m.id === modelId);
  if (!model) return null;
  return { model, lane, hasLaneOverride: Boolean(overrideId) };
}

function ModelChoiceChip({ blockId, config }: { blockId: string; config: ProjectConfig }) {
  const meta = getEffectiveModelForStackBlock(blockId, config);
  if (!meta) return null;
  const { model, lane, hasLaneOverride } = meta;
  const a11yId = `model-chip-desc-${blockId}`;
  return (
    <div className="group relative shrink-0">
      <span id={a11yId} className="sr-only">
        {model.name}, {model.provider}. {model.reasoning}
        {lane
          ? ` Subagent lane: ${lane.label}${hasLaneOverride ? ', dedicated model for this lane' : ', uses primary model'}.`
          : ''}
      </span>
      <span
        className="block max-w-[12rem] truncate rounded-sm border border-rule bg-transparent px-1.5 py-px text-[10px] font-medium text-ink-muted cursor-default outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
        aria-describedby={a11yId}
        tabIndex={0}
      >
        {model.name}
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute z-[230] right-0 bottom-[calc(100%+6px)] w-[min(18rem,calc(100vw-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100"
      >
        <p className="leading-snug">
          <span className="font-semibold text-surface">{model.name}</span>
          <span className="text-surface/55"> ({model.provider})</span>
        </p>
        {lane ? (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-surface/45">
            {lane.label}
            {hasLaneOverride ? ' · Dedicated model' : ' · Same as primary'}
          </p>
        ) : null}
        <p className="mt-1.5 leading-relaxed text-surface/85">{model.reasoning}</p>
      </div>
    </div>
  );
}

function TechChoiceChip({ option, instanceId }: { option: TechOption; instanceId: string }) {
  const a11yId = `tech-chip-desc-${instanceId}`;
  return (
    <div className="group relative shrink-0">
      <span id={a11yId} className="sr-only">
        {option.description}
        {option.pros.length > 0 ? ` Strengths: ${option.pros.join('. ')}` : ''}
      </span>
      <span
        className="block max-w-[12rem] truncate rounded-sm border border-rule bg-transparent px-1.5 py-px text-[10px] font-medium text-ink-muted cursor-default outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
        aria-describedby={a11yId}
        tabIndex={0}
      >
        {option.name}
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute z-[230] right-0 bottom-[calc(100%+6px)] w-[min(18rem,calc(100vw-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[10px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100"
      >
        <p className="leading-relaxed">{option.description}</p>
        {option.pros.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/15">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-surface/50 mb-1">
              Why this choice
            </p>
            <ul className="space-y-0.5 text-[10px] text-surface/75 list-disc pl-3.5 marker:text-surface/45">
              {option.pros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
