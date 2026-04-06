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
  onContinueSession: () => void;
}

export function PromptsHomePage({
  savedPrompts,
  currentConfig,
  onOpenPrompt,
  onDeletePrompt,
  onNewPrompt,
  onContinueSession,
}: PromptsHomePageProps) {
  const hasActiveSession = Boolean(currentConfig.projectTypeId);
  const typeMeta = (id: string) => projectTypes.find((t) => t.id === id);

  return (
    <div className="min-h-screen bg-surface overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16 animate-fade-in">
        <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-2">Tech Pack</p>
        <h1 className="text-[32px] sm:text-[40px] font-semibold text-ink leading-[1.08] tracking-[-0.02em] mb-2">
          Tech Packs
        </h1>
        <p className="text-sm text-ink-muted mb-10 max-w-xl leading-relaxed">
          Saved tech packs live in this browser. Open one to keep editing, or start fresh. Use{' '}
          <span className="text-ink-secondary font-medium">Save</span> in the workspace to add or update a pack in this
          list.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            type="button"
            onClick={onNewPrompt}
            className="px-5 py-3 text-[11px] font-bold text-surface bg-ink uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
          >
            New prompt
          </button>
          {hasActiveSession && (
            <button
              type="button"
              onClick={onContinueSession}
              className="px-5 py-3 text-[11px] font-bold text-ink uppercase tracking-wider border border-rule hover:bg-surface-raised transition-colors text-center"
            >
              Continue current session
            </button>
          )}
        </div>

        {hasActiveSession && (
          <section className="mb-10" aria-label="Current session">
            <h2 className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-3">In progress</h2>
            <div className="border border-accent/30 bg-accent-light/30 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[15px] font-semibold text-ink truncate">
                    {currentConfig.name.trim() || 'Untitled'}
                  </span>
                  {currentConfig.projectTypeId && (
                    <span className="shrink-0">
                      <ComplexityDots filled={typeMeta(currentConfig.projectTypeId)?.tier ?? 1} size="pill" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-muted">
                  {typeMeta(currentConfig.projectTypeId)?.name ?? 'Project'} · {currentConfig.selectedBlockIds.length}{' '}
                  blocks
                  {currentConfig.onboardingCompleted === false ? ' · Setup in progress' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={onContinueSession}
                className="shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-ink text-ink hover:bg-ink hover:text-surface transition-colors"
              >
                Open
              </button>
            </div>
          </section>
        )}

        <section aria-label="Saved prompts">
          <h2 className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-3">
            Saved ({savedPrompts.length})
          </h2>
          {savedPrompts.length === 0 ? (
            <p className="text-sm text-ink-muted border border-dashed border-rule px-5 py-8 text-center leading-relaxed">
              No saved prompts yet. Open the workspace, build a tech pack, and click{' '}
              <span className="text-ink-secondary font-medium">Save</span> to store it here.
            </p>
          ) : (
            <ul className="border border-rule divide-y divide-rule bg-surface">
              {savedPrompts.map((item) => {
                const t = typeMeta(item.projectTypeId);
                const isCurrent = item.id === currentConfig.id;
                return (
                  <li key={item.id} className="flex flex-col sm:flex-row sm:items-stretch gap-0">
                    <div className="flex-1 min-w-0 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-semibold text-ink truncate">
                              {item.name.trim() || 'Untitled'}
                            </span>
                            {t && (
                              <span className="shrink-0">
                                <ComplexityDots filled={t.tier} size="pill" />
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-accent shrink-0">
                                Current file
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted mt-1">
                            {t?.name ?? 'Project'} · {item.selectedBlockIds.length} blocks · Updated{' '}
                            {formatUpdated(item.updatedAt)}
                          </p>
                          {item.projectDescription.trim() && (
                            <p className="text-[11px] text-ink-secondary mt-2 line-clamp-2 leading-relaxed">
                              {item.projectDescription.trim()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col border-t sm:border-t-0 sm:border-l border-rule shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenPrompt(item)}
                        className="flex-1 sm:w-[7.5rem] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-ink hover:bg-surface-raised transition-colors"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePrompt(item.id)}
                        className="flex-1 sm:w-[7.5rem] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-red-700 hover:bg-red-50/80 transition-colors border-l sm:border-l-0 sm:border-t border-rule"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
