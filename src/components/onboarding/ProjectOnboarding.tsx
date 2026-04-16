import { useEffect, useMemo, useState } from 'react';
import type { ProjectConfig, ProjectFileResource, Tier } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { getTypeDetailFields } from '../../data/projectTypeDetailFields';
import { blocks } from '../../data/blocks';
import { techOptions } from '../../data/techOptions';
import {
  getVisibleIntegrations,
  type IntegrationCategory,
  type IntegrationItem,
} from '../../data/integrations';
import { toolRecommendations } from '../../data/models';
import { IntegrationBrandIcon } from '../icons/IntegrationBrandIcon';
import { BlockOcticon } from '../icons/OcticonById';
import { ComplexityDots } from '../ui/ComplexityDots';
import { ResourcesPanel } from '../resources/ResourcesPanel';
import { CustomSelect } from '../ui/CustomSelect';
import { TYPE_DETAIL_CHIP_BASE } from '../ui/typeDetailChipStyles';

const STEPS = ['details', 'blocks', 'resources'] as const;
type StepId = (typeof STEPS)[number];

function blockDefaultAndPickedTech(blockId: string, config: ProjectConfig) {
  const defaultOpt = techOptions.find((o) => o.blockId === blockId && o.isDefault);
  const pickedId = config.techChoices[blockId];
  const pickedOpt = pickedId ? techOptions.find((o) => o.id === pickedId) : undefined;
  return { defaultOpt, pickedOpt };
}

const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  skill: 'Skills',
  mcp: 'MCPs',
  api: 'APIs',
  library: 'Libraries',
};

const INTEGRATION_CATEGORY_ORDER: IntegrationCategory[] = ['skill', 'mcp', 'api', 'library'];

/** Matches Sidebar integration list row title (`SIDEBAR_CARD_PRIMARY`) */
const INTEGRATION_ROW_NAME = 'text-[10px] font-semibold leading-tight text-ink';

function OnboardingBlockExplanationTooltip({ blockId, explanation }: { blockId: string; explanation: string }) {
  const descId = `onboarding-block-explain-${blockId}`;
  return (
    <div className="group relative inline-flex max-w-full min-w-0">
      <button
        type="button"
        className="text-[10px] font-medium text-ink-muted decoration-rule decoration-1 underline-offset-2 hover:text-ink-secondary hover:decoration-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-1 focus-visible:ring-offset-surface rounded-sm text-left"
        aria-describedby={descId}
      >
        Full description
      </button>
      <span id={descId} className="sr-only">
        {explanation}
      </span>
      <div
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none absolute z-[250] left-0 top-[calc(100%+6px)] w-[min(20rem,calc(100vw-2.5rem))] rounded-md border border-white/12 bg-ink px-3 py-2.5 text-[10px] text-surface/90 leading-relaxed shadow-lg shadow-black/30 opacity-0 invisible scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100"
      >
        {explanation}
      </div>
    </div>
  );
}

interface ProjectOnboardingProps {
  config: ProjectConfig;
  tier: Tier;
  onComplete: () => void;
  onChangeProjectType: () => void;
  onSetName: (name: string) => void;
  onSetDescription: (desc: string) => void;
  onSetTypeDetail: (fieldId: string, value: string) => void;
  onSetTool: (toolId: string | null) => void;
  onToggleBlock: (blockId: string) => void;
  onToggleIntegration: (integrationId: string) => void;
  onAddResourceUrl: (label: string, url: string) => void;
  onAddResourceFile: (file: Omit<ProjectFileResource, 'id' | 'kind'>) => void;
  onRemoveResource: (id: string) => void;
}

export function ProjectOnboarding({
  config,
  tier,
  onComplete,
  onChangeProjectType,
  onSetName,
  onSetDescription,
  onSetTypeDetail,
  onSetTool,
  onToggleBlock,
  onToggleIntegration,
  onAddResourceUrl,
  onAddResourceFile,
  onRemoveResource,
}: ProjectOnboardingProps) {
  const [step, setStep] = useState<StepId>('details');
  const [integrationTab, setIntegrationTab] = useState<IntegrationCategory>('skill');

  const projectType = projectTypes.find((t) => t.id === config.projectTypeId);
  const typeDetailFields = config.projectTypeId ? getTypeDetailFields(config.projectTypeId) : [];
  const typeDetails = config.typeDetails ?? {};

  const visibleBlocks = useMemo(
    () =>
      blocks
        .filter((b) => b.statusForTier(tier) !== 'hidden')
        .sort((a, b) => {
          const order = { required: 0, recommended: 1, optional: 2, hidden: 3 };
          return order[a.statusForTier(tier)] - order[b.statusForTier(tier)];
        }),
    [tier],
  );

  const toolsForTier = useMemo(
    () =>
      toolRecommendations
        .filter((t) => t.tiers.includes(tier))
        .sort((a, b) => (a.id === 'cursor' ? -1 : b.id === 'cursor' ? 1 : 0)),
    [tier],
  );

  const selectedToolId = config.selectedToolIds[0];
  const toolSelectValue =
    selectedToolId && toolsForTier.some((t) => t.id === selectedToolId)
      ? selectedToolId
      : (toolsForTier[0]?.id ?? '');

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

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => {
    if (step === 'details') setStep('blocks');
    else if (step === 'blocks') setStep('resources');
    else onComplete();
  };
  const goBack = () => {
    if (step === 'details') onChangeProjectType();
    else if (step === 'blocks') setStep('details');
    else setStep('blocks');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-surface animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <header className="relative flex h-[calc(2*var(--geist-grid-major))] shrink-0 items-center border-b border-dashed border-rule-strong/70 geist-grid geist-grid--field px-8 sm:h-[calc(3*var(--geist-grid-major))] sm:px-10 lg:px-12">
        <div className="mx-auto w-full min-w-0 max-w-3xl">
          <div className="min-w-0">
            <p className="struct-label mb-2">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
            <h1
              id="onboarding-title"
              className="text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[44px]"
            >
              {step === 'details' && 'Project details'}
              {step === 'blocks' && 'Architecture blocks'}
              {step === 'resources' && 'Resources & integrations'}
            </h1>
            {projectType && (
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate text-[12px] text-ink-muted">{projectType.name}</span>
                <ComplexityDots filled={projectType.tier} size="pill" />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 sm:px-10 lg:px-12 [scrollbar-gutter:stable]">
        <div className="mx-auto w-full min-w-0 max-w-3xl py-8 sm:py-10 pb-32">
          {step === 'details' && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-ink-secondary leading-relaxed">
                Give this tech pack a name and describe what you are building. Pick the AI coding tool you plan to use
                so model suggestions and prompt wording stay compatible. The extra fields below are tailored to your
                project type.
              </p>
              <div className="border border-rule rounded-lg overflow-hidden divide-y divide-rule">
                <div className="p-4 sm:p-5">
                  <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => onSetName(e.target.value)}
                    placeholder="Untitled project"
                    className="w-full bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2">
                    Description
                  </label>
                  <textarea
                    value={config.projectDescription}
                    onChange={(e) => onSetDescription(e.target.value)}
                    placeholder="What does it do? Who is it for?"
                    rows={3}
                    className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none leading-relaxed"
                  />
                </div>
                {toolsForTier.length > 0 && (
                  <div className="p-4 sm:p-5">
                    <label
                      htmlFor="onboarding-ai-tool"
                      className="block text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2"
                    >
                      AI coding tool
                    </label>
                    <CustomSelect
                      id="onboarding-ai-tool"
                      className="max-w-md"
                      value={toolSelectValue}
                      onChange={(v) => onSetTool(v || null)}
                      options={toolsForTier.map((t) => ({
                        value: t.id,
                        label: t.name,
                        description: t.description,
                        iconKey: t.id,
                      }))}
                      aria-label="AI coding tool"
                      size="md"
                    />
                    <p className="mt-2 text-[10px] text-ink-muted leading-snug max-w-md">
                      {toolsForTier.find((t) => t.id === toolSelectValue)?.description}
                    </p>
                  </div>
                )}
                {typeDetailFields.map((field) => (
                  <div key={field.id} className="p-4 sm:p-5">
                    <div className="block text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2">
                      {field.label}
                    </div>
                    {field.input === 'chips' && field.options ? (
                      <div className="flex flex-wrap gap-2" role="group" aria-label={field.label} data-chip-group>
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
                                onClick={() => onSetTypeDetail(field.id, selected ? '' : opt.value)}
                                className={`${TYPE_DETAIL_CHIP_BASE} ${
                                  selected
                                    ? 'border-ink bg-ink text-surface'
                                    : 'border-rule bg-surface text-ink-secondary hover:border-neutral-300'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                      </div>
                    ) : field.input === 'select' && field.options ? (
                      <CustomSelect
                        id={`onboarding-type-detail-${field.id}`}
                        className="max-w-md"
                        value={typeDetails[field.id] ?? ''}
                        onChange={(v) => onSetTypeDetail(field.id, v)}
                        options={field.options.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                        size="md"
                        aria-label={field.label}
                      />
                    ) : field.multiline ? (
                      <textarea
                        value={typeDetails[field.id] ?? ''}
                        onChange={(e) => onSetTypeDetail(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows ?? 2}
                        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none resize-none leading-relaxed"
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

          {step === 'blocks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-lg border border-accent/25 bg-accent-light/40 px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.12em] mb-2">What are blocks?</p>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  <strong className="text-ink font-semibold">Blocks</strong> are the major pillars of your stack — things
                  like visual language, interactivity, routing, or a database. Each block maps to real technology
                  choices in the next screen. Required blocks are always on; recommended and optional ones let you shape
                  the architecture before you see the full tech stack.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 list-none p-0 m-0 items-stretch">
                {visibleBlocks.map((block) => {
                  const status = block.statusForTier(tier);
                  const isSelected = config.selectedBlockIds.includes(block.id);
                  const isRequired = status === 'required';
                  const active = isRequired || isSelected;
                  const { defaultOpt, pickedOpt } = blockDefaultAndPickedTech(block.id, config);

                  return (
                    <li
                      key={block.id}
                      className={`flex min-h-0 transition-opacity ${
                        !active && !isRequired ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex flex-col flex-1 w-full min-h-0 border border-rule rounded-lg overflow-visible bg-surface hover:bg-surface-raised/80 transition-colors">
                        <div className="flex gap-3 p-4 sm:p-5 flex-1 min-h-0">
                          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                              <span className={`text-[14px] sm:text-[15px] font-semibold leading-snug ${active ? 'text-ink' : 'text-ink-muted'}`}>
                                {block.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                  status === 'required'
                                    ? 'text-ink-muted'
                                    : status === 'recommended'
                                      ? 'text-accent'
                                      : 'text-ink-faint'
                                }`}
                              >
                                {status === 'required' ? 'Required' : status === 'recommended' ? 'Recommended' : 'Optional'}
                              </span>
                            </div>
                            <p className="text-[10px] text-ink-muted leading-relaxed">{block.summary}</p>
                            {(defaultOpt || pickedOpt) && (
                              <div className="mt-1.5 space-y-1 border-t border-rule/50 pt-1.5">
                                {!active && defaultOpt ? (
                                  <p className="text-[10px] leading-snug text-ink-muted">
                                    <span className="font-medium text-ink-secondary">{defaultOpt.name}</span>
                                  </p>
                                ) : null}
                                {active && pickedOpt && defaultOpt && pickedOpt.id === defaultOpt.id ? (
                                  <p className="text-[10px] leading-snug text-ink-muted">
                                    <span className="font-medium text-ink-secondary">{pickedOpt.name}</span>
                                  </p>
                                ) : null}
                                {active && pickedOpt && defaultOpt && pickedOpt.id !== defaultOpt.id ? (
                                  <>
                                    <p className="text-[10px] leading-snug text-ink-muted">
                                      <span className="font-medium text-ink-secondary">{defaultOpt.name}</span>
                                    </p>
                                    <p className="text-[10px] leading-snug text-ink-muted">
                                      <span className="font-semibold text-ink">{pickedOpt.name}</span>
                                    </p>
                                  </>
                                ) : null}
                                {active && pickedOpt && !defaultOpt ? (
                                  <p className="text-[10px] leading-snug text-ink-muted">
                                    <span className="font-medium text-ink-secondary">{pickedOpt.name}</span>
                                  </p>
                                ) : null}
                                {active && !pickedOpt && defaultOpt ? (
                                  <p className="text-[10px] leading-snug text-ink-muted">
                                    <span className="font-medium text-ink-secondary">{defaultOpt.name}</span>
                                  </p>
                                ) : null}
                              </div>
                            )}
                            <div className="flex-1 min-h-0 flex items-end pt-0.5">
                              <OnboardingBlockExplanationTooltip blockId={block.id} explanation={block.explanation} />
                            </div>
                          </div>
                          <span className="shrink-0 text-ink mt-0.5" aria-hidden>
                            <BlockOcticon blockId={block.id} size={20} />
                          </span>
                        </div>
                        {!isRequired && (
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex justify-end border-t border-rule/60 bg-surface/80">
                            <button
                              type="button"
                              onClick={() => onToggleBlock(block.id)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors w-full sm:w-auto min-w-[5.5rem] ${
                                isSelected
                                  ? 'border-ink bg-ink text-surface'
                                  : 'border-rule text-ink-muted hover:border-ink/30 hover:text-ink'
                              }`}
                            >
                              {isSelected ? 'Included' : 'Add'}
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {step === 'resources' && (
            <div className="space-y-8 animate-fade-in">
              <p className="text-sm text-ink-secondary leading-relaxed">
                Link specs, mockups, or drop small reference files. Optionally pick integrations (skills, MCPs, APIs)
                suggested for your type and description. You can skip this step and refine everything later in the
                sidebar — next you will land on the full <strong className="text-ink font-semibold">tech stack</strong>{' '}
                view.
              </p>

              <section>
                <h2 className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-3">Resources</h2>
                <div className="border border-rule rounded-lg overflow-hidden bg-surface-raised/30">
                  <ResourcesPanel
                    resources={config.resources ?? []}
                    onAddUrl={onAddResourceUrl}
                    onAddFile={onAddResourceFile}
                    onRemove={onRemoveResource}
                  />
                </div>
              </section>

              {visibleIntegrations.length > 0 ? (
                <section>
                  <h2 className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2">
                    Integrations
                  </h2>
                  <p className="text-[10px] text-ink-muted mb-3 leading-relaxed">
                    Suggested for your project. Links may open the skills directory or vendor docs.
                  </p>
                  <div className="border border-rule bg-surface rounded-lg overflow-hidden">
                    <div
                      role="tablist"
                      aria-label="Integration categories"
                      className="flex flex-wrap border-b border-rule bg-surface-raised gap-px"
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
                            onClick={() => setIntegrationTab(cat)}
                            className={`flex-1 min-w-[4.5rem] px-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors border-b-2 -mb-px ${
                              isActive
                                ? 'text-ink border-ink bg-surface'
                                : 'text-ink-muted border-transparent hover:text-ink-secondary'
                            }`}
                          >
                            {INTEGRATION_CATEGORY_LABELS[cat]}
                            {selectedHere > 0 ? (
                              <span className="ml-1 font-mono text-accent normal-case">{selectedHere}</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    <div
                      role="tabpanel"
                      className="max-h-[min(22rem,50vh)] overflow-y-auto flex flex-col gap-1 px-2 py-2"
                    >
                      {(integrationsByCategory.get(integrationTab) ?? []).map((item) => {
                        const isChosen = config.selectedIntegrationIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={isChosen}
                            onClick={() => onToggleIntegration(item.id)}
                            className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 ${
                              isChosen ? 'bg-surface-raised' : 'hover:bg-black/[0.04]'
                            }`}
                          >
                            <IntegrationBrandIcon
                              integrationId={item.id}
                              name={item.name}
                              category={item.category}
                            />
                            <div className="min-w-0 flex-1">
                              <p className={INTEGRATION_ROW_NAME}>{item.name}</p>
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
                              aria-hidden
                            >
                              {isChosen ? (
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                  aria-hidden
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  aria-hidden
                                >
                                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ) : (
                <p className="text-[10px] text-ink-muted border border-dashed border-rule rounded-lg px-4 py-3">
                  No integration suggestions yet. Add more detail in the first step to surface skills and APIs, or skip
                  and configure later.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-rule bg-surface/95 backdrop-blur-sm px-8 py-4 sm:px-10 lg:px-12">
        <div className="max-w-3xl mx-auto flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="text-[10px] font-bold tracking-wider text-ink-muted hover:text-ink py-2.5 sm:py-0 text-center sm:text-left"
          >
            {step === 'details' ? '← Change project type' : '← Back'}
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {step === 'resources' && (
              <button
                type="button"
                onClick={onComplete}
                className="order-2 sm:order-1 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted border border-rule hover:bg-surface-raised transition-colors"
              >
                Skip to tech stack
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className="order-1 sm:order-2 px-5 py-2.5 text-[10px] font-bold tracking-tight bg-ink text-surface hover:opacity-90 transition-opacity"
            >
              {step === 'resources' ? 'Finish & view stack' : 'Continue'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
