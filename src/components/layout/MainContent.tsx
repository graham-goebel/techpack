import { useState, useMemo } from 'react';
import type { ProjectConfig, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import { generatePrompt } from '../../utils/promptGenerator';
import { ArchitectureFlowCanvas } from '../architecture/ArchitectureFlowCanvas';
import { ComplexityDots } from '../ui/ComplexityDots';

interface MainContentProps {
  config: ProjectConfig;
  tier: Tier;
  onSave: () => void;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onSetProjectType: (typeId: string) => void;
}

export function MainContent({ config, tier, onSave, onToggleBlock, onSetTechChoice, onSetProjectType }: MainContentProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
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
                  <div aria-hidden className="mb-3">
                    <ComplexityDots filled={type.tier} size="dot" />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink tracking-tight mb-1 group-hover:text-accent transition-colors">
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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-surface">
      {/* Top bar — matches sidebar masthead (.app-chrome-row) */}
      <div className="app-chrome-row shrink-0 flex items-center justify-between border-b border-rule-strong px-5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-[22px] font-bold text-ink tracking-tight leading-none">
              {config.name || 'Untitled'}
            </h2>
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
              {projectType?.name}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-ink-muted uppercase tracking-wider">
            <span>{projectType?.tagline}</span>
            <span className="text-rule">|</span>
            <span>{selectedBlocks.length} blocks</span>
            <span className="text-rule">|</span>
            <span>{prompt.length.toLocaleString()} chars</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="border border-rule px-3 py-1.5 text-[10px] font-bold text-ink uppercase tracking-wider hover:bg-surface-raised transition-colors"
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              copied
                ? 'bg-ink/10 text-ink'
                : 'bg-ink text-surface hover:bg-ink-secondary'
            }`}
          >
            {copied ? 'Copied' : 'Copy Prompt'}
          </button>
        </div>
      </div>

      {/* Content: canvas fills space and scrolls internally; prompt docked to bottom */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Architecture area */}
        <div
          className={`border-b border-rule flex flex-1 min-h-0 flex-col ${viewMode === 'map' ? 'canvas-bg' : 'bg-surface-raised'}`}
        >
          {/* Header bar */}
          <div className="shrink-0 flex items-center justify-between min-h-10 px-5 py-2 bg-white/70 backdrop-blur-sm border-b border-rule">
            <div className="flex items-center gap-4">
              <h3 className="text-[22px] font-bold text-ink tracking-tight">
                Architecture
              </h3>
              <span className="text-[10px] text-ink-muted">
                {selectedBlocks.length} of {visibleBlocks.length} blocks active
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ComplexityDots
                filled={tier}
                size="bar"
                aria-label="Relative scope for this preset (more red = broader default stack)"
              />
              <div className="flex items-center border border-rule" role="group" aria-label="View mode">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  viewMode === 'list' ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink'
                }`}
                aria-pressed={viewMode === 'list'}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors border-l border-rule ${
                  viewMode === 'map' ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink'
                }`}
                aria-pressed={viewMode === 'map'}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
              </div>
            </div>
          </div>

          {/* List scrolls in an inset pane; map is full-bleed pan/zoom canvas */}
          <div
            className={`flex-1 min-h-0 relative min-w-0 ${
              viewMode === 'list'
                ? 'overflow-y-auto m-3 sm:m-4 border border-rule bg-surface rounded-lg'
                : 'overflow-hidden'
            }`}
          >
            {viewMode === 'list' ? (
              /* ──── LIST VIEW ──── */
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
                      className={`transition-colors ${!isSelected ? 'opacity-40' : ''}`}
                    >
                      {/* Row */}
                      <div className="flex items-center gap-2.5 px-5 py-3 hover:bg-surface-raised transition-colors">
                        {/* Toggle (optional / recommended only) */}
                        <div className="w-4 shrink-0 flex justify-center">
                          {!isRequired && (
                            <button
                              type="button"
                              onClick={() => onToggleBlock(block.id)}
                              className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-ink bg-ink' : 'border-neutral-300 bg-white hover:border-neutral-400'
                              }`}
                              aria-pressed={isSelected}
                              aria-label={isSelected ? 'Included' : 'Include'}
                            >
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </button>
                          )}
                        </div>

                        {/* Block icon (emoji) */}
                        <span className="text-base shrink-0 select-none leading-none" aria-hidden>
                          {block.icon}
                        </span>

                        {/* Name + summary */}
                        <button
                          type="button"
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className={`text-[13px] font-bold tracking-tight ${isSelected ? 'text-ink' : 'text-neutral-400'}`}>
                              {block.name}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                              status === 'required' ? 'text-ink-muted' : status === 'recommended' ? 'text-accent' : 'text-ink-faint'
                            }`}>
                              {status === 'required' ? 'Required' : status === 'recommended' ? 'Recommended' : 'Optional'}
                            </span>
                          </div>
                          {isSelected && (
                            <p className="text-[11px] text-ink-muted leading-snug mt-0.5 line-clamp-1">
                              {block.summary}
                            </p>
                          )}
                        </button>

                        {/* Tech chip */}
                        {isSelected && chosenOption && (
                          <span className="shrink-0 text-[10px] text-ink-secondary bg-surface-raised border border-rule px-2 py-0.5">
                            {chosenOption.name}
                          </span>
                        )}

                        {/* Chevron */}
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
                      </div>

                      {/* Expanded detail panel */}
                      {isExpanded && isSelected && (
                        <div className="bg-surface-raised border-t border-rule animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule">
                            <div className="bg-surface-raised px-5 py-3">
                              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">What is this</p>
                              <p className="text-[11px] text-ink-secondary leading-relaxed">{block.explanation}</p>
                            </div>
                            <div className="bg-surface-raised px-5 py-3">
                              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Why</p>
                              <p className="text-[11px] text-ink-secondary leading-relaxed">{block.whyNeeded}</p>
                            </div>
                          </div>
                          {blockOptions.length > 0 && (() => {
                            const isComparing = comparingBlockId === block.id;
                            return (
                              <div className="border-t border-rule">
                                {/* Chosen option summary */}
                                <div className="px-5 py-3">
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
                                          className={`w-full text-left px-5 py-3 border-b border-rule last:border-b-0 transition-colors ${
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
            ) : (
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
          </div>
        </div>

        {/* Prompt — collapsed by default; Copy always visible; pinned to viewport bottom */}
        <div className="shrink-0 px-6 py-5 border-t border-rule bg-surface">
          <div
            className={`flex items-center justify-between gap-3 ${promptExpanded ? 'mb-3' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              <h3 className="text-[22px] font-bold text-ink tracking-tight shrink-0">
                Prompt
              </h3>
              {!promptExpanded && prompt.length > 0 && (
                <span className="text-[10px] text-ink-muted tabular-nums">
                  {prompt.length.toLocaleString()} chars
                </span>
              )}
              <button
                type="button"
                onClick={() => setPromptExpanded((v) => !v)}
                className="text-[9px] font-bold text-ink-muted uppercase tracking-wider hover:text-ink transition-colors flex items-center gap-1 shrink-0"
                aria-expanded={promptExpanded}
              >
                <svg
                  className={`h-3 w-3 transition-transform ${promptExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                {promptExpanded ? 'Hide' : 'Expand'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0 text-ink-muted hover:text-ink"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {promptExpanded && (
            <div className="border border-rule">
              <pre className="p-5 text-[12px] text-ink-secondary font-mono leading-[1.7] whitespace-pre-wrap overflow-x-auto overflow-y-auto max-h-[min(28rem,42vh)]">
                {prompt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
