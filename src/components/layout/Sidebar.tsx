import { useCallback, useRef, useState } from 'react';
import type { ProjectConfig, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { getTypeDetailFields } from '../../data/projectTypeDetailFields';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import { modelRecommendations, toolRecommendations } from '../../data/models';
import { ComplexityDots } from '../ui/ComplexityDots';

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
  onToggleTool: (toolId: string) => void;
}

type SectionId = 'project' | 'blocks' | 'ai';

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
  onToggleTool,
}: SidebarProps) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(['project']),
  );
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const toggle = useCallback((id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.has(id)) {
        requestAnimationFrame(() => {
          sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      return next;
    });
  }, []);

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

  const typeDetailFields = config.projectTypeId
    ? getTypeDetailFields(config.projectTypeId)
    : [];
  const typeDetails = config.typeDetails ?? {};

  const models = modelRecommendations.filter((m) => m.tiers.includes(tier));
  const tools = toolRecommendations
    .filter((t) => t.tiers.includes(tier))
    .sort((a, b) => (a.id === 'cursor' ? -1 : b.id === 'cursor' ? 1 : 0));

  return (
    <aside className="w-[304px] shrink-0 border-r border-rule bg-surface flex flex-col h-screen overflow-hidden">
      {/* Masthead — same height + border as main chrome row */}
      <div className="app-chrome-row shrink-0 flex flex-col justify-center px-5 border-b border-rule-strong">
        <div className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.15em] leading-none">
          Tech Pack
        </div>
        <div className="text-[22px] font-bold text-ink leading-none tracking-tight mt-1.5">
          Builder
        </div>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto">
        {/* ── PROJECT DETAILS ─────────────────────── */}
        <SectionHeader
          label="Project Details"
          open={openSections.has('project')}
          onToggle={() => toggle('project')}
          sectionRef={(el) => { sectionRefs.current.project = el; }}
        />
        {openSections.has('project') && (
          <div className="px-3 pb-3 animate-fade-in space-y-3">
            {/* Name + Description tile */}
            <div className="border border-rule bg-surface">
              <div className="px-3 py-1.5 bg-surface-raised border-b border-rule">
                <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">
                  Details
                </span>
              </div>
              <div className="px-3 py-2.5 border-b border-rule">
                <label className="block text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em] mb-1">Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => onSetName(e.target.value)}
                  placeholder="Untitled"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                />
              </div>
              <div
                className={`px-3 py-2.5 ${
                  config.projectTypeId && typeDetailFields.length > 0 ? 'border-b border-rule' : ''
                }`}
              >
                <label className="block text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em] mb-1">Description</label>
                <textarea
                  value={config.projectDescription}
                  onChange={(e) => onSetDescription(e.target.value)}
                  placeholder="What does it do?"
                  rows={2}
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none"
                />
              </div>
              {config.projectTypeId &&
                typeDetailFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`px-3 py-2.5 ${
                      idx < typeDetailFields.length - 1 ? 'border-b border-rule' : ''
                    }`}
                  >
                    <label className="block text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em] mb-1">
                      {field.label}
                    </label>
                    {field.input === 'chips' && field.options ? (
                      <div
                        className="flex flex-wrap gap-1.5 pt-0.5"
                        role="group"
                        aria-label={field.label}
                      >
                        {field.options
                          .filter((opt) => opt.value !== '')
                          .map((opt) => {
                            const selected = (typeDetails[field.id] ?? '') === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  onSetTypeDetail(field.id, selected ? '' : opt.value)
                                }
                                className={`px-2 py-1 text-[10px] font-semibold leading-tight tracking-tight rounded-sm border transition-colors text-left ${
                                  selected
                                    ? 'bg-ink text-surface border-ink'
                                    : 'bg-surface text-ink-secondary border-rule hover:bg-surface-raised hover:border-neutral-300'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                      </div>
                    ) : field.input === 'select' && field.options ? (
                      <select
                        value={typeDetails[field.id] ?? ''}
                        onChange={(e) => onSetTypeDetail(field.id, e.target.value)}
                        className="w-full bg-transparent text-sm text-ink focus:outline-none cursor-pointer border border-rule rounded-sm px-1 py-0.5"
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value || 'placeholder'} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.multiline ? (
                      <textarea
                        value={typeDetails[field.id] ?? ''}
                        onChange={(e) => onSetTypeDetail(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows ?? 2}
                        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={typeDetails[field.id] ?? ''}
                        onChange={(e) => onSetTypeDetail(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                      />
                    )}
                  </div>
                ))}
            </div>

            {/* Project type — show tiles only when none selected, otherwise compact display */}
            {config.projectTypeId ? (
              <div className="border border-rule bg-surface">
                <div className="px-3 py-1.5 bg-surface-raised border-b border-rule flex items-center justify-between">
                  <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">
                    Type
                  </span>
                  <button
                    onClick={() => onSetProjectType('')}
                    className="text-[9px] font-bold text-ink-faint uppercase tracking-wider hover:text-accent transition-colors"
                  >
                    Change
                  </button>
                </div>
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <ComplexityDots filled={tier} size="pill" aria-hidden />
                  <span className="text-sm font-bold text-ink">
                    {projectTypes.find((t) => t.id === config.projectTypeId)?.name}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="px-1 mb-1.5">
                  <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">
                    Type
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => onSetProjectType(type.id)}
                      className="text-left px-3 py-3.5 bg-surface hover:bg-surface-raised transition-colors"
                    >
                      <div aria-hidden className="mb-2">
                        <ComplexityDots filled={type.tier} size="pill" />
                      </div>
                      <div className="text-[11px] font-bold leading-tight text-ink-secondary">
                        {type.name}
                      </div>
                      <div className="text-[9px] mt-1 leading-snug text-ink-muted">
                        {type.tagline}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BUILDING BLOCKS ─────────────────────── */}
        {config.projectTypeId && (
          <>
            <SectionHeader
              label="Building Blocks"
              count={config.selectedBlockIds.length}
              open={openSections.has('blocks')}
              onToggle={() => toggle('blocks')}
              sectionRef={(el) => { sectionRefs.current.blocks = el; }}
            />
            {openSections.has('blocks') && (
              <div className="px-3 pb-3 animate-fade-in space-y-3">
                {/* Included blocks (required + user-added) */}
                {includedBlocks.length > 0 && (
                  <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
                    {includedBlocks.map((block) => {
                      const status = block.statusForTier(tier);
                      const isRequired = status === 'required';
                      const isExpanded = expandedBlockId === block.id;
                      const chosenOption = techOptions.find(
                        (o) => o.id === config.techChoices[block.id],
                      );

                      return (
                        <div
                          key={block.id}
                          className={`bg-surface flex flex-col transition-colors ${
                            isExpanded ? 'col-span-2' : ''
                          }`}
                        >
                          <div className={isExpanded ? '' : 'aspect-square'}>
                            <button
                              onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                              className="w-full h-full text-left p-2.5 hover:bg-surface-raised transition-colors flex flex-col"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                  isRequired ? 'text-ink-muted' : 'text-ink-faint'
                                }`}>
                                  {isRequired ? 'Required' : 'Added'}
                                </span>
                                {isRequired ? (
                                  <span
                                    className="shrink-0 h-3 w-3 text-ink-faint"
                                    title="Required"
                                    aria-label="Required"
                                    role="img"
                                  >
                                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleBlock(block.id);
                                    }}
                                    className="shrink-0 h-3.5 w-3.5 text-ink-faint hover:text-accent transition-colors"
                                    aria-label="Remove from project"
                                    title="Remove"
                                  >
                                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="text-[11px] font-bold text-ink leading-tight">
                                {block.name}
                              </div>
                              {chosenOption && (
                                <div className="text-[9px] text-ink-muted mt-0.5">
                                  {chosenOption.name}
                                </div>
                              )}
                              {!chosenOption && (
                                <div className="text-[9px] text-ink-faint mt-0.5 leading-snug line-clamp-2">
                                  {block.summary}
                                </div>
                              )}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-rule bg-surface-raised animate-fade-in">
                              <div className="px-2.5 py-2.5 space-y-2">
                                <p className="text-[10px] text-ink-secondary leading-relaxed">{block.explanation}</p>
                                <div>
                                  <p className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em] mb-0.5">Why</p>
                                  <p className="text-[10px] text-ink-secondary leading-relaxed">{block.whyNeeded}</p>
                                </div>
                              </div>
                              {block.techOptionIds.length > 0 && (() => {
                                const options = techOptions.filter((o) => block.techOptionIds.includes(o.id));
                                const chosenId = config.techChoices[block.id];
                                return (
                                  <div className="border-t border-rule">
                                    <div className="px-2.5 py-1.5">
                                      <span className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em]">Technology</span>
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
                                            isChosen ? 'bg-ink text-surface' : 'hover:bg-surface'
                                          }`}
                                        >
                                          <div className={`mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                            isChosen ? 'border-surface' : 'border-ink-faint'
                                          }`}>
                                            {isChosen && <div className="h-1 w-1 rounded-full bg-surface" />}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[10px] font-bold">{option.name}</span>
                                              {option.isDefault && (
                                                <span className={`text-[8px] font-bold uppercase tracking-wider ${
                                                  isChosen ? 'text-surface/50' : 'text-accent'
                                                }`}>Default</span>
                                              )}
                                            </div>
                                            <p className={`text-[9px] leading-snug mt-0.5 line-clamp-2 ${
                                              isChosen ? 'text-surface/60' : 'text-ink-muted'
                                            }`}>{option.description}</p>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recommended / optional blocks not yet added */}
                {recommendedBlocks.length > 0 && (
                  <div>
                    <p className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.15em] mb-1.5">
                      Recommended
                    </p>
                    <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
                      {recommendedBlocks.map((block) => {
                        const status = block.statusForTier(tier);
                        const isExpanded = expandedBlockId === block.id;

                        return (
                          <div
                            key={block.id}
                            className={`bg-surface flex flex-col transition-colors opacity-60 hover:opacity-100 ${
                              isExpanded ? 'col-span-2 opacity-100' : ''
                            }`}
                          >
                            <div className={isExpanded ? '' : 'aspect-square'}>
                              <button
                                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                                className="w-full h-full text-left p-2.5 hover:bg-surface-raised transition-colors flex flex-col"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                    status === 'recommended' ? 'text-accent' : 'text-ink-faint'
                                  }`}>
                                    {status === 'recommended' ? 'Rec' : 'Opt'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleBlock(block.id);
                                    }}
                                    className="shrink-0 h-4 w-4 text-ink-faint hover:text-ink transition-colors"
                                    aria-label={`Add ${block.name} to project`}
                                    title="Add to project"
                                  >
                                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="text-[11px] font-bold text-ink leading-tight">
                                  {block.name}
                                </div>
                                <div className="text-[9px] text-ink-faint mt-0.5 leading-snug line-clamp-2">
                                  {block.summary}
                                </div>
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-rule px-2.5 py-2.5 bg-surface-raised space-y-2 animate-fade-in">
                                <p className="text-[10px] text-ink-secondary leading-relaxed">{block.explanation}</p>
                                <div>
                                  <p className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em] mb-0.5">Why</p>
                                  <p className="text-[10px] text-ink-secondary leading-relaxed">{block.whyNeeded}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onToggleBlock(block.id)}
                                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-ink hover:text-accent border border-rule hover:border-accent transition-colors"
                                >
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                  </svg>
                                  Add to project
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tech Stack section removed — tech choices are inline in each block's expanded view */}

        {/* ── AI & TOOLS ─────────────────────────── */}
        {config.projectTypeId && (
          <>
            <SectionHeader
              label="AI & Tools"
              open={openSections.has('ai')}
              onToggle={() => toggle('ai')}
              sectionRef={(el) => { sectionRefs.current.ai = el; }}
            />
            {openSections.has('ai') && (
              <div className="px-3 pb-3 space-y-3 animate-fade-in">
                {/* Model selector — single pick */}
                <div className="border border-rule bg-surface">
                  <div className="px-3 py-1.5 bg-surface-raised border-b border-rule">
                    <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">Model</span>
                  </div>
                  {models.map((m) => {
                    const isChosen = config.selectedModelId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onSetModel(m.id)}
                        className={`w-full text-left px-3 py-2 border-b border-rule last:border-b-0 transition-colors ${
                          isChosen ? 'bg-ink text-surface' : 'hover:bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                            isChosen ? 'border-surface' : 'border-ink-faint'
                          }`}>
                            {isChosen && <div className="h-1 w-1 rounded-full bg-surface" />}
                          </div>
                          <span className="text-[11px] font-bold flex-1 truncate">{m.name}</span>
                          <span className={`text-[9px] ${isChosen ? 'text-surface/50' : 'text-ink-faint'}`}>{m.provider}</span>
                        </div>
                        <p className={`text-[9px] leading-snug mt-0.5 ml-[18px] line-clamp-2 ${
                          isChosen ? 'text-surface/60' : 'text-ink-muted'
                        }`}>
                          {m.reasoning}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Tool selector — multi pick */}
                <div className="border border-rule bg-surface">
                  <div className="px-3 py-1.5 bg-surface-raised border-b border-rule">
                    <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">Tools</span>
                  </div>
                  {tools.map((t) => {
                    const isChosen = config.selectedToolIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onToggleTool(t.id)}
                        className={`w-full text-left px-3 py-2 border-b border-rule last:border-b-0 transition-colors ${
                          isChosen ? 'bg-ink text-surface' : 'hover:bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 shrink-0 border flex items-center justify-center transition-colors ${
                            isChosen ? 'border-surface/50 bg-surface/20' : 'border-ink-faint'
                          }`}>
                            {isChosen && (
                              <svg className="h-2 w-2 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] font-bold flex-1 truncate">{t.name}</span>
                          {t.url && (
                            <a
                              href={t.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`text-[9px] ${isChosen ? 'text-surface/50 hover:text-surface/80' : 'text-accent hover:underline'}`}
                            >
                              ↗
                            </a>
                          )}
                        </div>
                        <p className={`text-[9px] leading-snug mt-0.5 ml-5 line-clamp-2 ${
                          isChosen ? 'text-surface/60' : 'text-ink-muted'
                        }`}>
                          {t.reasoning}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function SectionHeader({
  label,
  count,
  open,
  onToggle,
  sectionRef,
}: {
  label: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  sectionRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <button
      ref={sectionRef as React.Ref<HTMLButtonElement>}
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-5 py-2 text-left border-t border-rule hover:bg-surface-raised transition-colors"
    >
      <svg
        className={`h-2.5 w-2.5 text-ink-muted transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
      >
        <path strokeLinecap="square" d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-[10px] font-bold text-ink uppercase tracking-[0.15em] flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] text-ink-muted font-semibold tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

