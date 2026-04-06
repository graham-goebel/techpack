import { useState, useMemo } from 'react';
import type { ProjectConfig, TechOption, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import { generatePrompt } from '../../utils/promptGenerator';
import { ArchitectureFlowCanvas } from '../architecture/ArchitectureFlowCanvas';
import { BlockOcticon } from '../icons/OcticonById';
import { ComplexityDots } from '../ui/ComplexityDots';
interface MainContentProps {
  config: ProjectConfig;
  tier: Tier;
  onSave: () => void;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onSetProjectType: (typeId: string) => void;
  onGoHome?: () => void;
}

export function MainContent({
  config,
  tier,
  onSave,
  onToggleBlock,
  onSetTechChoice,
  onSetProjectType,
  onGoHome,
}: MainContentProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'architecture' | 'map' | 'prompt'>('architecture');
  const [comparingBlockId, setComparingBlockId] = useState<string | null>(null);

  const projectType = projectTypes.find((t) => t.id === config.projectTypeId);
  const selectedBlocks = blocks.filter((b) => config.selectedBlockIds.includes(b.id));
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

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!config.projectTypeId) {
    return (
      <div className="flex-1 overflow-y-auto bg-surface">
        <div className="max-w-4xl mx-auto px-8 py-12 animate-fade-in">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="text-[10px] font-bold text-accent uppercase tracking-wider hover:underline mb-6"
            >
              ← All prompts
            </button>
          )}
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.15em] mb-2">
            Tech Pack
          </p>
          <h1 className="text-[32px] sm:text-[44px] font-bold text-ink leading-[1.05] tracking-tight mb-2">
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
                  <h3 className="text-[15px] font-semibold text-ink tracking-tight mb-1 group-hover:text-accent transition-colors">
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
                    <span className="font-bold">{typeBlocks.length}</span>
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

  const visibleBlocks = blocks
    .filter((b) => b.statusForTier(tier) !== 'hidden')
    .sort((a, b) => {
      const order = { required: 0, recommended: 1, optional: 2, hidden: 3 };
      return order[a.statusForTier(tier)] - order[b.statusForTier(tier)];
    });

  const tabSurfaceClass =
    mainTab === 'map' ? 'canvas-bg' : 'bg-surface-raised';

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-surface">
      <div className="flex-1 min-h-0 flex flex-col">
        <div className={`border-b border-rule flex flex-1 min-h-0 flex-col ${tabSurfaceClass}`}>
          {/* Top chrome: tabs + meta + save — matches sidebar .app-chrome-row height */}
          <div className="app-chrome-row shrink-0 flex flex-col justify-center gap-2 px-5 py-2 bg-white/70 backdrop-blur-sm border-b border-rule min-w-0 box-border">
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div
                className="flex items-center rounded border border-rule overflow-hidden shrink-0"
                role="tablist"
                aria-label="Workspace"
              >
                {(
                  [
                    { id: 'architecture' as const, label: 'Architecture' },
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
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      i > 0 ? 'border-l border-rule' : ''
                    } ${
                      mainTab === tab.id
                        ? 'bg-ink text-surface'
                        : 'text-ink-muted hover:text-ink bg-surface/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onGoHome && (
                  <button
                    type="button"
                    onClick={onGoHome}
                    className="text-[10px] font-bold text-accent uppercase tracking-wider hover:underline px-1 hidden sm:inline"
                  >
                    All prompts
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="border border-rule px-3 py-1.5 text-[10px] font-bold text-ink uppercase tracking-wider hover:bg-surface-raised transition-colors"
                >
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[10px] text-ink-muted uppercase tracking-wider min-w-0 leading-tight">
              <span className="font-semibold text-ink-secondary truncate">{projectType?.name}</span>
              <span className="text-rule shrink-0">|</span>
              <span className="shrink-0 tabular-nums">
                {selectedBlocks.length}/{visibleBlocks.length} blocks
              </span>
              {projectType?.tagline && (
                <>
                  <span className="text-rule shrink-0 hidden sm:inline">|</span>
                  <span className="truncate hidden sm:inline max-w-[14rem] lg:max-w-[20rem]">
                    {projectType.tagline}
                  </span>
                </>
              )}
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
          </div>

          {/* Single shared content region for Architecture, Map, and Prompt */}
          <div
            role="tabpanel"
            id={`main-tab-panel-${mainTab}`}
            aria-labelledby={`main-tab-${mainTab}`}
            className={`flex-1 min-h-0 relative min-w-0 flex flex-col overflow-hidden ${
              mainTab === 'map' ? '' : 'p-3 sm:p-4'
            }`}
          >
            {mainTab === 'architecture' && (
              <div className="flex-1 min-h-0 overflow-y-auto border border-rule bg-surface rounded-lg">
                <div className="divide-y divide-rule">
                {visibleBlocks.map((block) => {
                  const status = block.statusForTier(tier);
                  const isSelected = config.selectedBlockIds.includes(block.id);
                  const isRequired = status === 'required';
                  const isExpanded = expandedBlockId === block.id;
                  const chosenOptionId = config.techChoices[block.id];
                  const chosenOption = techOptions.find((o) => o.id === chosenOptionId);
                  const blockOptions = techOptions.filter((o) => o.blockId === block.id);

                  return (
                    <div
                      key={block.id}
                      className={`transition-colors ${!isSelected && !isRequired ? 'opacity-60' : ''}`}
                    >
                      {/* Row */}
                      <div className="flex items-center gap-2.5 px-5 py-5 min-h-[4.5rem] hover:bg-surface-raised transition-colors">
                        <span className="shrink-0 text-ink-muted flex items-center justify-center" aria-hidden>
                          <BlockOcticon blockId={block.id} size={18} />
                        </span>

                        {/* Name + summary */}
                        <button
                          type="button"
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className={`text-[13px] font-semibold tracking-tight ${isSelected || isRequired ? 'text-ink' : 'text-neutral-400'}`}>
                              {block.name}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                              status === 'required' ? 'text-ink-muted' : status === 'recommended' ? 'text-accent' : 'text-ink-faint'
                            }`}>
                              {status === 'required' ? 'Required' : status === 'recommended' ? 'Recommended' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-muted leading-snug mt-1 line-clamp-2">
                            {block.summary}
                          </p>
                        </button>

                        {/* Tech chip */}
                        {isSelected && chosenOption && (
                          <TechChoiceChip option={chosenOption} instanceId={block.id} />
                        )}

                        {/* Add/remove or expand chevron */}
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
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Expanded detail panel */}
                      {isExpanded && isSelected && (
                        <div className="bg-surface-raised border-t border-rule animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule">
                            <div className="bg-surface-raised px-5 py-4">
                              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">What is this</p>
                              <p className="text-[11px] text-ink-secondary leading-relaxed">{block.explanation}</p>
                            </div>
                            <div className="bg-surface-raised px-5 py-4">
                              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Why</p>
                              <p className="text-[11px] text-ink-secondary leading-relaxed">{block.whyNeeded}</p>
                            </div>
                          </div>
                          {blockOptions.length > 0 && (() => {
                            const isComparing = comparingBlockId === block.id;
                            return (
                              <div className="border-t border-rule">
                                {/* Chosen option summary */}
                                <div className="px-5 py-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">Technology</p>
                                    <button
                                      type="button"
                                      onClick={() => setComparingBlockId(isComparing ? null : block.id)}
                                      className="text-[9px] font-bold text-ink-muted uppercase tracking-wider hover:text-ink transition-colors flex items-center gap-1"
                                    >
                                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
                                      </svg>
                                      {isComparing ? 'Hide comparison' : 'Help me decide'}
                                    </button>
                                  </div>

                                  {/* Selected tech chips */}
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

                                  {/* Why this one */}
                                  {chosenOption && !isComparing && (
                                    <div className="mt-2">
                                      <p className="text-[11px] text-ink-secondary leading-relaxed mb-1.5">
                                        {chosenOption.description}
                                      </p>
                                      {chosenOption.pros.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {chosenOption.pros.map((pro, i) => (
                                            <span key={i} className="text-[9px] text-ink-muted bg-surface border border-rule px-1.5 py-0.5">
                                              {pro}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Comparison table */}
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
                                            <div className={`h-2.5 w-2.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                              isChosen ? 'border-ink bg-ink' : 'border-neutral-300'
                                            }`}>
                                              {isChosen && <span className="h-1 w-1 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-[12px] font-bold ${isChosen ? 'text-ink' : 'text-ink-secondary'}`}>
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
                                                <span key={i} className="text-[9px] text-green-700 bg-green-50 border border-green-100 px-1.5 py-px">
                                                  + {pro}
                                                </span>
                                              ))}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {option.cons.map((con, i) => (
                                                <span key={i} className="text-[9px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-px">
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
          </div>
        </div>
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
