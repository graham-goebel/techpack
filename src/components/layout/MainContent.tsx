import { useState, useMemo, useCallback } from 'react';
import type { Block, ProjectConfig, TechOption, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import { groupVisibleBlocksByStackLayer } from '../../data/stackLayers';
import { generatePrompt } from '../../utils/promptGenerator';
import { ArchitectureFlowCanvas } from '../architecture/ArchitectureFlowCanvas';
import { BlockOcticon } from '../icons/OcticonById';
import { ComplexityDots } from '../ui/ComplexityDots';
import { HomeNavButton } from '../ui/HomeNavButton';
interface MainContentProps {
  config: ProjectConfig;
  tier: Tier;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onSetProjectType: (typeId: string) => void;
  onGoHome?: () => void;
}

export function MainContent({
  config,
  tier,
  onToggleBlock,
  onSetTechChoice,
  onSetProjectType,
  onGoHome,
}: MainContentProps) {
  const [copied, setCopied] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
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
          {onGoHome && (
            <div className="mb-6">
              <HomeNavButton onClick={onGoHome} iconSize={18} />
            </div>
          )}
          <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-2">
            Tech Pack
          </p>
          <h1 className="text-[32px] sm:text-[44px] font-semibold text-ink leading-[1.08] tracking-[-0.02em] mb-2">
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
                  className="text-left p-5 bg-transparent border border-rule/25 hover:bg-white/45 hover:backdrop-blur-sm hover:border-rule/40 transition-colors group"
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

                  <div className="flex items-center gap-1.5 text-[9px] text-ink-faint">
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

  const tabSurfaceClass =
    mainTab === 'map' ? 'canvas-bg' : 'bg-surface-raised';

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
            className={`flex-1 min-h-0 relative min-w-0 flex flex-col overflow-hidden ${
              mainTab === 'map'
                ? 'pt-16 sm:pt-[4.5rem]'
                : stackOrPromptTabPanelPad
            }`}
          >
            {mainTab === 'architecture' && (
              <div className="flex-1 min-h-0 flex flex-col gap-3 min-w-0">
                <header className="shrink-0">
                  <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.12em] mb-1">
                    Stack
                  </p>
                  <h2 className="text-[18px] sm:text-[20px] font-semibold text-ink tracking-tight mb-1.5">
                    Project Stack
                  </h2>
                  <p className="text-[13px] text-ink-muted leading-relaxed max-w-2xl">
                    A checklist of capability areas for your build, ordered from presentation through
                    client, server, data, and operations—the same layers as the map. Required items stay
                    on; add optional blocks when you need them. Expand a row for context, tradeoffs, and
                    technology choices, or collapse a section header to hide a whole layer.
                  </p>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 min-w-0">
                {stackGroups.map((group) => {
                  const isCollapsed = hiddenStackLayers.has(group.layerId);
                  const panelId = `stack-section-${group.layerId}`;
                  const headId = `stack-section-head-${group.layerId}`;
                  return (
                    <section
                      key={group.layerId}
                      className="min-w-0 rounded-lg border border-rule overflow-hidden divide-y divide-rule bg-surface"
                    >
                      <button
                        type="button"
                        onClick={() => toggleStackLayerVisibility(group.layerId)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left bg-surface-raised/50 hover:bg-surface-raised transition-colors"
                        aria-expanded={!isCollapsed}
                        aria-controls={panelId}
                        id={headId}
                      >
                        <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
                            {group.label}
                          </span>
                          <span className="text-[10px] text-ink-muted tabular-nums">
                            {group.blocks.length} block{group.blocks.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <span className="shrink-0 flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              isCollapsed ? 'text-ink-faint' : 'text-ink-muted'
                            }`}
                          >
                            {isCollapsed ? 'Hidden' : 'Shown'}
                          </span>
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
              <div className="flex-1 min-h-0 flex flex-col border border-rule bg-surface rounded-lg overflow-hidden">
                <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-rule bg-surface-raised/60">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider tabular-nums">
                    {prompt.length > 0
                      ? `${prompt.length.toLocaleString()} characters`
                      : 'No prompt yet'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!prompt}
                    className="text-[10px] font-bold text-ink uppercase tracking-wider border border-rule px-3 py-1 hover:bg-surface-raised transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="flex-1 min-h-0 overflow-auto p-5 text-[12px] text-ink-secondary font-mono leading-[1.7] whitespace-pre-wrap">
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
                className="pointer-events-auto flex max-w-full items-center overflow-hidden rounded-lg border border-rule bg-white/90 shadow-lg shadow-black/10 backdrop-blur-md"
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
                    className={`min-w-0 shrink px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors sm:px-3 ${
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
}) {
  const status = block.statusForTier(tier);
  const isSelected = config.selectedBlockIds.includes(block.id);
  const isRequired = status === 'required';
  const isExpanded = expandedBlockId === block.id;
  const chosenOptionId = config.techChoices[block.id];
  const chosenOption = techOptions.find((o) => o.id === chosenOptionId);
  const blockOptions = techOptions.filter((o) => o.blockId === block.id);

  return (
    <div
      className={`transition-colors ${!isSelected && !isRequired ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-2.5 px-5 py-5 min-h-[4.5rem] hover:bg-surface-raised transition-colors">
        <span className="shrink-0 text-ink-muted flex items-center justify-center" aria-hidden>
          <BlockOcticon blockId={block.id} size={18} />
        </span>

        <button
          type="button"
          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-baseline gap-2">
            <span
              className={`text-[13px] font-semibold tracking-tight ${
                isSelected || isRequired ? 'text-ink' : 'text-neutral-400'
              }`}
            >
              {block.name}
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider ${
                status === 'required'
                  ? 'text-ink-muted'
                  : status === 'recommended'
                    ? 'text-accent'
                    : 'text-ink-faint'
              }`}
            >
              {status === 'required'
                ? 'Required'
                : status === 'recommended'
                  ? 'Recommended'
                  : 'Optional'}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted leading-snug mt-1 line-clamp-2">
            {block.summary}
          </p>
        </button>

        {isSelected && chosenOption && (
          <TechChoiceChip option={chosenOption} instanceId={block.id} />
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
        <div className="bg-surface-raised border-t border-rule animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule">
            <div className="bg-surface-raised px-5 py-4">
              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">
                What is this
              </p>
              <p className="text-[11px] text-ink-secondary leading-relaxed">{block.explanation}</p>
            </div>
            <div className="bg-surface-raised px-5 py-4">
              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Why</p>
              <p className="text-[11px] text-ink-secondary leading-relaxed">{block.whyNeeded}</p>
            </div>
          </div>
          {blockOptions.length > 0 &&
            (() => {
              const isComparing = comparingBlockId === block.id;
              return (
                <div className="border-t border-rule">
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">
                        Technology
                      </p>
                      <button
                        type="button"
                        onClick={() => setComparingBlockId(isComparing ? null : block.id)}
                        className="text-[9px] font-bold text-ink-muted uppercase tracking-wider hover:text-ink transition-colors flex items-center gap-1"
                      >
                        <svg
                          className="h-3 w-3"
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
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {blockOptions.map((option) => {
                        const isChosen = chosenOptionId === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onSetTechChoice(block.id, option.id)}
                            className={`px-2.5 py-1 text-[10px] font-semibold border transition-colors ${
                              isChosen
                                ? 'bg-ink text-surface border-ink'
                                : 'bg-surface text-ink-secondary border-rule hover:bg-white hover:border-neutral-300'
                            }`}
                            aria-pressed={isChosen}
                          >
                            {option.name}
                            {option.isDefault && !isChosen && (
                              <span className="ml-1 text-[8px] text-accent font-bold">Default</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {chosenOption && !isComparing && (
                      <div className="mt-2">
                        <p className="text-[11px] text-ink-secondary leading-relaxed mb-1.5">
                          {chosenOption.description}
                        </p>
                        {chosenOption.pros.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {chosenOption.pros.map((pro, i) => (
                              <span
                                key={i}
                                className="text-[9px] text-ink-muted bg-surface border border-rule px-1.5 py-0.5"
                              >
                                {pro}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isComparing && (
                    <div className="border-t border-rule animate-fade-in">
                      {blockOptions.map((option) => {
                        const isChosen = chosenOptionId === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onSetTechChoice(block.id, option.id)}
                            className={`w-full text-left px-5 py-4 border-b border-rule last:border-b-0 transition-colors ${
                              isChosen ? 'bg-surface' : 'hover:bg-surface-raised'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`h-2.5 w-2.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                  isChosen ? 'border-ink bg-ink' : 'border-neutral-300'
                                }`}
                              >
                                {isChosen && <span className="h-1 w-1 rounded-full bg-white" />}
                              </div>
                              <span
                                className={`text-[12px] font-bold ${
                                  isChosen ? 'text-ink' : 'text-ink-secondary'
                                }`}
                              >
                                {option.name}
                              </span>
                              {option.isDefault && (
                                <span className="text-[8px] font-bold text-accent uppercase">Default</span>
                              )}
                            </div>
                            <p className="text-[11px] text-ink-muted leading-relaxed ml-[18px] mb-1.5">
                              {option.description}
                            </p>
                            <div className="ml-[18px] flex flex-wrap gap-x-4 gap-y-1">
                              <div className="flex flex-wrap gap-1">
                                {option.pros.map((pro, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] text-green-700 bg-green-50 border border-green-100 px-1.5 py-px"
                                  >
                                    + {pro}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {option.cons.map((con, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-px"
                                  >
                                    − {con}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      )}
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
        className="block text-[10px] text-ink-secondary bg-surface-raised border border-rule px-2 py-0.5 rounded-sm cursor-default outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
        aria-describedby={a11yId}
        tabIndex={0}
      >
        {option.name}
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute z-[80] right-0 bottom-[calc(100%+6px)] w-[min(18rem,calc(100vw-2rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[11px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100"
      >
        <p className="leading-relaxed">{option.description}</p>
        {option.pros.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/15">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-surface/50 mb-1">
              Why this choice
            </p>
            <ul className="space-y-0.5 text-[11px] text-surface/75 list-disc pl-3.5 marker:text-surface/45">
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
