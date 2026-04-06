import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Block, ProjectConfig, ProjectFileResource, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { getTypeDetailFields } from '../../data/projectTypeDetailFields';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import { blockLibraries } from '../../data/libraries';
import { modelsForToolAndTier, toolRecommendations } from '../../data/models';
import {
  getVisibleIntegrations,
  skillsShUrl,
  type IntegrationCategory,
  type IntegrationItem,
} from '../../data/integrations';
import { CheckIcon } from '@primer/octicons-react';
import { BlockOcticon } from '../icons/OcticonById';
import { ComplexityDots } from '../ui/ComplexityDots';
import { HomeNavButton } from '../ui/HomeNavButton';
import { ResourcesPanel } from '../resources/ResourcesPanel';

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
  onSetTool: (toolId: string | null) => void;
  onToggleLibrary: (libraryId: string) => void;
  onToggleIntegration: (integrationId: string) => void;
  onAddResourceUrl: (label: string, url: string) => void;
  onAddResourceFile: (file: Omit<ProjectFileResource, 'id' | 'kind'>) => void;
  onRemoveResource: (id: string) => void;
  onSave: () => void;
  onGoHome?: () => void;
}

type SectionId = 'type' | 'project' | 'blocks' | 'resources' | 'integrations';

const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  skill: 'Skills',
  mcp: 'MCPs',
  api: 'APIs',
  library: 'Libraries',
};

const INTEGRATION_CATEGORY_ORDER: IntegrationCategory[] = ['skill', 'mcp', 'api', 'library'];

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
  onSetTool,
  onToggleLibrary,
  onToggleIntegration,
  onAddResourceUrl,
  onAddResourceFile,
  onRemoveResource,
  onSave,
  onGoHome,
}: SidebarProps) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set());
  const [saved, setSaved] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [projectTypeMenuOpen, setProjectTypeMenuOpen] = useState(false);
  const projectTypeMenuRef = useRef<HTMLDivElement>(null);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const toolMenuRef = useRef<HTMLDivElement>(null);
  const [integrationTab, setIntegrationTab] = useState<IntegrationCategory>('skill');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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
    if (!openSections.has('type')) setProjectTypeMenuOpen(false);
  }, [openSections]);

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
    if (!openSections.has('type')) setToolMenuOpen(false);
  }, [openSections]);

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

  const handleSave = useCallback(() => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [onSave]);

  return (
    <aside className="relative w-[304px] shrink-0 border-r border-rule bg-surface flex flex-col h-screen overflow-hidden">
      {/* Masthead — same height + border as main chrome row */}
      <div className="app-chrome-row shrink-0 flex flex-col justify-center px-5 border-b border-rule-strong min-w-0">
        <div
          className="text-[22px] font-semibold text-ink leading-none tracking-tight truncate min-w-0"
          title={config.name.trim() || undefined}
        >
          {config.name.trim() || 'Untitled'}
        </div>
        <div className="mt-1.5 min-w-0">
          {selectedProjectType ? (
            <div className="min-w-0 flex items-center gap-2 flex-wrap text-[10px] text-ink-muted uppercase tracking-wider leading-snug">
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
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.15em] leading-snug min-w-0 truncate block">
              Tech Pack
            </span>
          )}
        </div>
      </div>

      {/* Scrollable sections — min-h-full + trailing flex spacer keeps blocks top-aligned and fills viewport */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-24">
          <div className="flex min-h-full flex-col">
        {/* ── OVERVIEW ────────────────────────────── */}
        <SectionHeader
          label="Overview"
          open={openSections.has('type')}
          onToggle={() => toggle('type')}
          sectionRef={(el) => { sectionRefs.current.type = el; }}
          suppressTopBorder
        />
        {openSections.has('type') && (
          <div className="px-3 pb-3 animate-fade-in">
            <div className="relative" ref={projectTypeMenuRef}>
              <button
                type="button"
                onClick={() => setProjectTypeMenuOpen((o) => !o)}
                aria-expanded={projectTypeMenuOpen}
                aria-haspopup="listbox"
                aria-label="Project type"
                className="w-full flex items-start gap-2 px-3 py-2.5 text-left border border-rule/40 rounded-lg bg-white/35 hover:bg-white/50 backdrop-blur-sm transition-colors"
              >
                <div className="min-w-0 flex-1 w-full">
                  {selectedProjectType ? (
                    <>
                      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                        <span className="text-[13px] font-semibold text-ink leading-tight truncate min-w-0">
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
                    <span className="text-[12px] font-semibold text-ink-faint">
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
                  className="absolute z-50 left-0 right-0 mt-1 max-h-[min(22rem,65vh)] overflow-y-auto rounded-lg border border-rule bg-surface shadow-md py-1"
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
                        className={`w-full text-left px-3 py-2.5 border-b border-rule last:border-b-0 transition-colors ${
                          isSelected ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                          <span className={`text-[13px] font-semibold leading-tight truncate min-w-0 ${isSelected ? 'text-ink' : 'text-ink-secondary'}`}>
                            {type.name}
                          </span>
                          <span aria-hidden className="shrink-0">
                            <ComplexityDots filled={type.tier} size="pill" />
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted leading-snug mt-1 pl-0">
                          {type.tagline}
                        </p>
                      </button>
                    );
                  })}
                  {config.projectTypeId && (
                    <div className="border-t border-rule px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSetProjectType('');
                          setProjectTypeMenuOpen(false);
                        }}
                        className="w-full text-center py-1.5 text-[9px] font-bold uppercase tracking-wider text-ink-faint hover:text-accent transition-colors"
                      >
                        Clear selection
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {config.projectTypeId && (
              <div className="mt-3 pt-3 border-t border-rule space-y-3">
                <p className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em] px-0.5">
                  AI & tooling
                </p>
                {/* Tool dropdown — above model list */}
                <div className="relative" ref={toolMenuRef}>
                  <button
                    type="button"
                    onClick={() => setToolMenuOpen((o) => !o)}
                    aria-expanded={toolMenuOpen}
                    aria-haspopup="listbox"
                    aria-label="AI coding tool"
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left border border-rule/40 rounded-lg bg-white/35 hover:bg-white/50 backdrop-blur-sm transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      {selectedTool ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-ink leading-tight truncate">
                              {selectedTool.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-muted leading-snug mt-1 line-clamp-2">
                            {selectedTool.description}
                          </p>
                        </>
                      ) : (
                        <span className="text-[12px] font-semibold text-ink-faint">
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
                      className="absolute z-50 left-0 right-0 mt-1 max-h-[min(22rem,65vh)] overflow-y-auto rounded-lg border border-rule bg-surface shadow-md py-1"
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
                            className={`w-full text-left px-3 py-2.5 border-b border-rule last:border-b-0 transition-colors ${
                              isSelected ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-[13px] font-semibold leading-tight flex-1 truncate ${isSelected ? 'text-ink' : 'text-ink-secondary'}`}>
                                {t.name}
                              </span>
                              {t.url && (
                                <a
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[9px] text-accent hover:underline shrink-0"
                                >
                                  ↗
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-ink-muted leading-snug mt-1 line-clamp-2">
                              {t.reasoning}
                            </p>
                          </button>
                        );
                      })}
                      {selectedToolId && (
                        <div className="border-t border-rule px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSetTool(null);
                              setToolMenuOpen(false);
                            }}
                            className="w-full text-center py-1.5 text-[9px] font-bold uppercase tracking-wider text-ink-faint hover:text-accent transition-colors"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Model selector — single pick, options depend on tool */}
                <div className="border border-rule border-b-0 bg-surface">
                  <div className="px-3 py-1.5 bg-surface-raised border-b border-rule">
                    <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">Model</span>
                  </div>
                  {models.length === 0 ? (
                    <p className="px-3 py-3 text-[9px] text-ink-faint leading-snug">
                      Choose a tool to see compatible models.
                    </p>
                  ) : (
                    models.map((m) => {
                      const isChosen = config.selectedModelId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onSetModel(m.id)}
                          className={`w-full text-left px-3 py-2 border-b border-rule last:border-b-0 transition-colors ${
                            isChosen ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                              isChosen ? 'border-ink bg-ink' : 'border-ink-faint'
                            }`}>
                              {isChosen && <div className="h-1 w-1 rounded-full bg-surface" />}
                            </div>
                            <span className={`text-[13px] font-semibold flex-1 truncate ${isChosen ? 'text-ink' : 'text-ink-secondary'}`}>{m.name}</span>
                            <span className="text-[10px] text-ink-faint">{m.provider}</span>
                          </div>
                          <p className={`text-[11px] leading-snug mt-0.5 ml-[18px] line-clamp-2 ${
                            isChosen ? 'text-ink-muted' : 'text-ink-faint'
                          }`}>
                            {m.reasoning}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DETAILS ─────────────────────────────── */}
        {config.projectTypeId && (
          <>
            <SectionHeader
              label="Details"
              open={openSections.has('project')}
              onToggle={() => toggle('project')}
              sectionRef={(el) => { sectionRefs.current.project = el; }}
            />
            {openSections.has('project') && (
              <div className="px-3 pb-3 animate-fade-in">
                <div className="border border-rule border-b-0 bg-surface">
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
                      typeDetailFields.length > 0 ? 'border-b border-rule' : ''
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
                  {typeDetailFields.map((field, idx) => (
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
                                      ? 'bg-surface-raised text-ink border-ink/30'
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
              </div>
            )}
          </>
        )}

        {/* ── BLOCKS ──────────────────────────────── */}
        {config.projectTypeId && (
          <>
            <SectionHeader
              label="Blocks"
              count={config.selectedBlockIds.length}
              open={openSections.has('blocks')}
              onToggle={() => toggle('blocks')}
              sectionRef={(el) => { sectionRefs.current.blocks = el; }}
            />
            {openSections.has('blocks') && (
              <div className="px-3 pb-3 animate-fade-in space-y-3">
                {/* Included blocks (required + user-added) */}
                {includedBlocks.length > 0 && (
                  <div
                    className={`flex flex-col gap-px bg-rule border border-rule ${
                      recommendedBlocks.length === 0 ? 'border-b-0' : ''
                    }`}
                  >
                    {includedBlocks.map((block) => {
                      const status = block.statusForTier(tier);
                      const isRequired = status === 'required';
                      const isExpanded = expandedBlockId === block.id;
                      const techForPreview =
                        techOptions.find((o) => o.id === config.techChoices[block.id]) ??
                        techOptions.find((o) => o.blockId === block.id && o.isDefault);
                      const tileDescId = `block-desc-${block.id}`;
                      return (
                        <div key={block.id} className="flex flex-col gap-px min-w-0 w-full">
                          <div className="group relative bg-surface flex flex-col min-w-0 w-full">
                            <span id={tileDescId} className="sr-only">
                              {block.summary}
                            </span>
                            <div className="w-full">
                              <button
                                type="button"
                                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                                aria-describedby={tileDescId}
                                className="w-full min-h-[60px] text-left px-3 py-3 pr-11 hover:bg-surface-raised transition-colors flex items-center gap-2.5 relative"
                              >
                                {!isRequired && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleBlock(block.id);
                                    }}
                                    className="absolute top-1/2 right-2.5 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-ink-faint opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto hover:text-accent"
                                    aria-label="Remove from project"
                                    title="Remove"
                                  >
                                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <span
                                  className={`pointer-events-none absolute right-2.5 top-1/2 z-[1] -translate-y-1/2 text-accent transition-opacity duration-150 ${
                                    isRequired ? '' : 'opacity-100 group-hover:opacity-0 group-focus-within:opacity-0'
                                  }`}
                                  aria-hidden
                                >
                                  <CheckIcon size={14} />
                                </span>
                                <span className="shrink-0 text-ink-muted flex items-center justify-center" aria-hidden>
                                  <BlockOcticon blockId={block.id} size={18} />
                                </span>
                                <div className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
                                  <div className="text-[12px] font-semibold text-ink leading-snug line-clamp-2 w-full pr-1">
                                    {block.name}
                                  </div>
                                  {techForPreview ? (
                                    <div className="text-[11px] text-ink-muted leading-snug line-clamp-2 w-full pr-1">
                                      {techForPreview.name}
                                    </div>
                                  ) : null}
                                </div>
                              </button>
                            </div>
                            {!isExpanded && (
                              <div
                                role="tooltip"
                                className="pointer-events-none absolute z-[70] left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] w-[min(17rem,calc(100vw-1.5rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[11px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100"
                              >
                                {block.summary}
                              </div>
                            )}
                          </div>
                          {isExpanded && (
                            <div className="min-w-0 w-full flex flex-col">
                              <IncludedBlockExpandedPanel
                                block={block}
                                config={config}
                                onSetTechChoice={onSetTechChoice}
                                onToggleLibrary={onToggleLibrary}
                              />
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
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.15em]">
                        Recommended
                      </p>
                      <button
                        type="button"
                        onClick={() => recommendedBlocks.forEach((b) => onToggleBlock(b.id))}
                        className="text-[8px] font-bold text-ink-faint uppercase tracking-wider hover:text-accent transition-colors"
                      >
                        Add all
                      </button>
                    </div>
                    <div className="flex flex-col gap-px bg-rule border border-rule border-b-0">
                      {recommendedBlocks.map((block) => {
                        const isExpanded = expandedBlockId === block.id;
                        const techForPreview =
                          techOptions.find((o) => o.id === config.techChoices[block.id]) ??
                          techOptions.find((o) => o.blockId === block.id && o.isDefault);
                        const tileDescId = `block-desc-rec-${block.id}`;
                        return (
                          <div key={block.id} className="flex flex-col gap-px min-w-0 w-full">
                            <div
                              className={`group relative bg-surface flex flex-col min-w-0 w-full transition-opacity ${
                                isExpanded ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <span id={tileDescId} className="sr-only">
                                {block.summary}
                              </span>
                              <div className="w-full">
                                <button
                                  type="button"
                                  onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                                  aria-describedby={tileDescId}
                                  className="w-full min-h-[60px] text-left px-3 py-3 pr-10 hover:bg-surface-raised transition-colors flex items-center gap-2.5 relative"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleBlock(block.id);
                                    }}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-ink-faint hover:text-ink transition-colors z-10"
                                    aria-label={`Add ${block.name} to project`}
                                    title="Add to project"
                                  >
                                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                    </svg>
                                  </button>
                                  <span className="shrink-0 text-ink-muted flex items-center justify-center" aria-hidden>
                                    <BlockOcticon blockId={block.id} size={18} />
                                  </span>
                                  <div className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
                                    <div className="text-[12px] font-semibold text-ink leading-snug line-clamp-2 w-full pr-1">
                                      {block.name}
                                    </div>
                                    {techForPreview ? (
                                      <div className="text-[11px] text-ink-muted leading-snug line-clamp-2 w-full pr-1">
                                        {techForPreview.name}
                                      </div>
                                    ) : null}
                                  </div>
                                </button>
                              </div>
                              {!isExpanded && (
                                <div
                                  role="tooltip"
                                  className="pointer-events-none absolute z-[70] left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] w-[min(17rem,calc(100vw-1.5rem))] rounded-md border border-white/12 bg-ink px-2.5 py-2 text-[11px] text-surface/90 leading-snug shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100"
                                >
                                  {block.summary}
                                </div>
                              )}
                            </div>
                            {isExpanded && (
                              <div className="min-w-0 w-full border-t border-rule px-2.5 py-2.5 bg-surface-raised space-y-2 animate-fade-in">
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

        {/* ── RESOURCES ─────────────────────────────── */}
        {config.projectTypeId && (
          <>
            <SectionHeader
              label="Resources"
              count={(config.resources ?? []).length}
              open={openSections.has('resources')}
              onToggle={() => toggle('resources')}
              sectionRef={(el) => { sectionRefs.current.resources = el; }}
            />
            {openSections.has('resources') && (
              <div className="px-3 pb-3 animate-fade-in min-w-0 max-w-full flex-1 min-h-0 flex flex-col">
                <ResourcesPanel
                  variant="sidebar"
                  resources={config.resources ?? []}
                  onAddUrl={onAddResourceUrl}
                  onAddFile={onAddResourceFile}
                  onRemove={onRemoveResource}
                />
              </div>
            )}
          </>
        )}

        {/* ── INTEGRATIONS ─────────────────────────── */}
        {config.projectTypeId && visibleIntegrations.length > 0 && (
          <>
            <SectionHeader
              label="Integrations"
              count={config.selectedIntegrationIds.length}
              open={openSections.has('integrations')}
              onToggle={() => toggle('integrations')}
              sectionRef={(el) => { sectionRefs.current.integrations = el; }}
            />
            {openSections.has('integrations') && (
              <div className="px-3 pb-3 space-y-2 animate-fade-in">
                <p className="text-[9px] text-ink-muted leading-snug px-0.5">
                  Suggested for your project type and description. Skills link to the{' '}
                  <a
                    href="https://skills.sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-semibold"
                  >
                    skills.sh
                  </a>{' '}
                  directory.
                </p>
                <div className="border border-rule bg-surface overflow-hidden">
                  <div
                    role="tablist"
                    aria-label="Integration categories"
                    className="flex border-b border-rule bg-surface-raised"
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
                          className={`flex-1 min-w-0 px-1.5 py-2 text-[8px] font-bold uppercase tracking-[0.08em] transition-colors border-b-2 -mb-px ${
                            isActive
                              ? 'text-ink border-ink bg-surface'
                              : 'text-ink-muted border-transparent hover:text-ink-secondary hover:bg-surface/80'
                          }`}
                        >
                          <span className="block truncate text-center leading-tight">
                            {INTEGRATION_CATEGORY_LABELS[cat]}
                            {selectedHere > 0 ? (
                              <span className="font-mono font-normal text-[9px] normal-case tracking-normal text-accent">
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
                    className="max-h-[min(20rem,45vh)] overflow-y-auto"
                  >
                    {(integrationsByCategory.get(integrationTab) ?? []).map((item) => {
                      const isChosen = config.selectedIntegrationIds.includes(item.id);
                      const href = item.skillsShPath ? skillsShUrl(item.skillsShPath) : item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onToggleIntegration(item.id)}
                          className={`group relative w-full text-left px-3 py-2 border-b border-rule last:border-b-0 transition-colors ${
                            isChosen ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-0.5 h-3 w-3 shrink-0 border flex items-center justify-center transition-colors ${
                              isChosen ? 'border-ink bg-ink' : 'border-ink-faint'
                            }`}>
                              {isChosen && (
                                <svg className="h-2 w-2 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 pr-6">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[11px] font-bold ${isChosen ? 'text-ink' : 'text-ink-secondary'}`}>
                                  {item.name}
                                </span>
                              </div>
                              <p className={`text-[9px] leading-snug mt-0.5 line-clamp-2 ${
                                isChosen ? 'text-ink-muted' : 'text-ink-faint'
                              }`}>
                                {item.description}
                              </p>
                              {item.installHint && (
                                <p className="text-[8px] text-ink-faint mt-1 font-mono leading-tight">
                                  {item.installHint}
                                </p>
                              )}
                            </div>
                          </div>
                          {href && (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`${item.name} — open link in new tab`}
                              className="absolute top-2 right-2 z-10 text-[9px] font-semibold text-accent hover:underline opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
                            >
                              ↗
                            </a>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
            <div className="flex-1 grow basis-0 min-h-0 shrink-0" aria-hidden />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-50 flex flex-col gap-2">
        <div
          className="pointer-events-auto flex flex-col gap-2 rounded-lg border border-rule bg-white/90 p-2 shadow-lg shadow-black/10 backdrop-blur-md"
          role="group"
          aria-label="Quick actions"
        >
          {onGoHome && (
            <HomeNavButton
              onClick={onGoHome}
              iconSize={18}
              className="border-transparent p-2 text-accent hover:border-rule hover:bg-accent-light/40 hover:text-accent"
            />
          )}
          <button
            type="button"
            onClick={handleSave}
            className="border border-rule px-3 py-2 text-[10px] font-bold text-ink uppercase tracking-wider hover:bg-surface-raised transition-colors whitespace-nowrap"
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </aside>
  );
}

function IncludedBlockExpandedPanel({
  block,
  config,
  onSetTechChoice,
  onToggleLibrary,
}: {
  block: Block;
  config: ProjectConfig;
  onSetTechChoice: (blockId: string, optionId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
}) {
  return (
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
                      <span className={`text-[10px] font-bold ${isChosen ? 'text-ink' : 'text-ink-secondary'}`}>{option.name}</span>
                      {option.isDefault && (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-accent">Default</span>
                      )}
                    </div>
                    <p className={`text-[9px] leading-snug mt-0.5 line-clamp-2 ${
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
              <span className="text-[8px] font-bold text-ink-faint uppercase tracking-[0.12em]">Libraries</span>
            </div>
            <div className="px-2.5 pb-2 space-y-2">
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="text-[8px] font-semibold text-ink-faint uppercase tracking-wider mb-1">{cat}</p>
                  <div className="flex flex-wrap gap-1">
                    {libs.filter((l) => l.category === cat).map((lib) => {
                      const isActive = config.selectedLibraryIds.includes(lib.id);
                      return (
                        <button
                          key={lib.id}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onToggleLibrary(lib.id); }}
                          title={lib.description}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold rounded-sm border transition-colors ${
                            isActive
                              ? 'bg-surface text-ink border-ink/30'
                              : 'bg-transparent text-ink-faint border-rule hover:text-ink-secondary hover:border-rule-strong'
                          }`}
                        >
                          {!isActive && (
                            <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                            </svg>
                          )}
                          {lib.name}
                          {isActive && (
                            <svg className="h-2 w-2 shrink-0 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
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

function SectionHeader({
  label,
  count,
  open,
  onToggle,
  sectionRef,
  suppressTopBorder,
}: {
  label: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  sectionRef?: (el: HTMLElement | null) => void;
  /** Avoid stacking with the masthead’s bottom border (first section only). */
  suppressTopBorder?: boolean;
}) {
  return (
    <div
      ref={sectionRef}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-expanded={open}
      className={`w-full shrink-0 flex items-center gap-2.5 px-5 py-3.5 min-h-[44px] text-left hover:bg-surface-raised transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        suppressTopBorder ? '' : 'border-t border-rule'
      }`}
    >
      <h4 className="text-[15px] font-semibold text-ink tracking-tight flex-1 leading-tight m-0">
        {label}
      </h4>
      {count !== undefined && (
        <span className="text-[11px] text-ink-muted font-semibold tabular-nums">
          {count}
        </span>
      )}
      <svg
        className={`h-3 w-3 shrink-0 text-ink-muted transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
        aria-hidden={true}
      >
        <path strokeLinecap="square" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

