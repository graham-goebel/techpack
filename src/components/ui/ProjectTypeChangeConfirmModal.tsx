import { useEffect } from 'react';
import { projectTypes } from '../../data/projectTypes';

interface ProjectTypeChangeConfirmModalProps {
  pendingTypeId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ProjectTypeChangeConfirmModal({
  pendingTypeId,
  onConfirm,
  onCancel,
}: ProjectTypeChangeConfirmModalProps) {
  const clearing = pendingTypeId === '';
  const nextName = clearing
    ? null
    : projectTypes.find((t) => t.id === pendingTypeId)?.name ?? 'another type';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink/35 backdrop-blur-[2px]"
      role="presentation"
      onClick={onCancel}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="project-type-change-title"
        aria-describedby="project-type-change-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-rule bg-surface shadow-xl shadow-black/15 p-5 sm:p-6"
      >
        <h2
          id="project-type-change-title"
          className="text-lg font-semibold text-ink tracking-tight mb-2"
        >
          {clearing ? 'Clear project type?' : 'Switch project type?'}
        </h2>
        <p id="project-type-change-desc" className="text-sm text-ink-secondary leading-relaxed mb-6">
          {clearing ? (
            <>
              You will return to the project type chooser. Blocks, tech choices, integrations, resources,
              and type-specific fields for this tech pack will be reset. Your pack name is kept.
            </>
          ) : (
            <>
              Switching to <span className="font-medium text-ink">{nextName}</span> resets blocks, tech
              choices, integrations, resources, and type-specific details to match the new type. Your pack
              name is kept. This cannot be undone.
            </>
          )}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted border border-rule hover:bg-surface-raised transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-ink text-surface hover:opacity-90 transition-opacity rounded-md"
          >
            {clearing ? 'Clear and continue' : 'Switch type'}
          </button>
        </div>
      </div>
    </div>
  );
}
