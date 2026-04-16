import type { ProjectConfig } from '../../types';
import { projectTypes } from '../../data/projectTypes';
import { ComplexityDots } from '../ui/ComplexityDots';

function formatUpdated(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

interface PromptsHomePageProps {
  savedPrompts: ProjectConfig[];
  currentConfig: ProjectConfig;
  onOpenPrompt: (config: ProjectConfig) => void;
  onDeletePrompt: (id: string) => void;
  onNewPrompt: () => void;
}

export function PromptsHomePage({
  savedPrompts,
  currentConfig,
  onOpenPrompt,
  onDeletePrompt,
  onNewPrompt,
}: PromptsHomePageProps) {
  const typeMeta = (id: string) => projectTypes.find((t) => t.id === id);

  return (
    <div className="min-h-screen overflow-y-auto bg-surface [scrollbar-gutter:stable]">
      <button
        type="button"
        onClick={onNewPrompt}
        aria-label="New prompt"
        className="fixed top-4 right-4 z-40 flex size-11 shrink-0 items-center justify-center rounded-none sm:top-6 sm:right-6 sm:size-12 text-[24px] font-medium leading-none text-surface bg-ink hover:opacity-90 transition-opacity border border-ink shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      >
        +
      </button>

      <div>
        <section
          aria-label="Introduction"
          className="border-b border-dashed border-rule-strong/70 bg-surface"
        >
          <div className="mx-auto max-w-6xl px-6 py-7 sm:py-9">
            <div className="mb-6 pr-16 sm:pr-0">
              <p className="struct-label mb-1.5">Tech pack · 001</p>
              <h1 className="text-[32px] font-semibold leading-[1.06] tracking-[-0.03em] text-ink sm:text-[40px]">
                Tech Packs
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-snug text-ink-muted">
              A tech pack is a saved blueprint for a project: what you&apos;re building, which stack blocks and add-ons are
              in scope, and a generated prompt you can paste into an AI or your docs. Packs live only in this browser and
              update as you work. Open a saved pack below to continue, or use New prompt to start from scratch.
            </p>
          </div>
        </section>

        {/* Projects: coarse grid field; cards read as occupying cells */}
        <section aria-label="Saved prompts" className="geist-grid geist-grid--field min-h-[min(50vh,28rem)]">
          <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <h2 className="struct-label mb-6">
              Saved — <span className="tabular-nums">{savedPrompts.length}</span>
            </h2>
            {savedPrompts.length === 0 ? (
              <p className="border border-dashed border-rule-strong bg-surface px-5 py-10 text-center text-sm leading-relaxed text-ink-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline outline-1 outline-dotted outline-black/[0.06]">
                No saved packs yet. Open the workspace, choose a project type, and your tech pack will appear here
                automatically.
              </p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-1 gap-px rounded-sm border border-rule bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-3">
                {savedPrompts.map((item) => {
                  const t = typeMeta(item.projectTypeId);
                  const isCurrent = item.id === currentConfig.id;
                  const packTitle = item.name.trim() || 'Untitled';
                  return (
                    <li
                      key={item.id}
                      className="group relative flex min-h-[11rem] flex-col overflow-hidden bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-[background-color,box-shadow] hover:bg-surface-raised hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenPrompt(item)}
                        className="flex min-h-[10.5rem] flex-1 flex-col gap-2 p-4 pr-11 text-left transition-colors hover:bg-surface-raised/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/12"
                        aria-label={`Open tech pack: ${packTitle}`}
                      >
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <span className="min-w-0 truncate text-[28px] font-semibold leading-tight tracking-tight text-ink">
                            {packTitle}
                          </span>
                          {t ? (
                            <span className="shrink-0">
                              <ComplexityDots filled={t.tier} size="pill" />
                            </span>
                          ) : null}
                        </div>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Current file</span>
                        ) : null}
                        <p className="text-[10px] text-ink-muted">
                          {t?.name ?? 'Project'} · {item.selectedBlockIds.length} blocks · Updated{' '}
                          {formatUpdated(item.updatedAt)}
                        </p>
                        {item.projectDescription.trim() ? (
                          <p className="line-clamp-3 text-[10px] leading-relaxed text-ink-secondary">
                            {item.projectDescription.trim()}
                          </p>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePrompt(item.id);
                        }}
                        className="absolute right-1.5 top-1.5 z-10 rounded p-1.5 text-ink-faint transition-[opacity,background-color,color] md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100 hover:bg-red-50/90 hover:text-red-700 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ink/20 md:focus-visible:pointer-events-auto"
                        aria-label={`Delete ${packTitle}`}
                        title="Delete"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
