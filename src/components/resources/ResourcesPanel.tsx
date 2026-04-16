import { useCallback, useRef, useState, type FormEvent } from 'react';
import type { ProjectFileResource, ProjectResource } from '../../types';

const MAX_FILE_BYTES = 512 * 1024;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResourcesPanelProps {
  resources: ProjectResource[];
  onAddUrl: (label: string, url: string) => void;
  onAddFile: (file: Omit<ProjectFileResource, 'id' | 'kind'>) => void;
  onRemove: (id: string) => void;
  /** Narrow layout for the sidebar column */
  variant?: 'default' | 'sidebar';
}

export function ResourcesPanel({
  resources,
  onAddUrl,
  onAddFile,
  onRemove,
  variant = 'default',
}: ResourcesPanelProps) {
  const isSidebar = variant === 'sidebar';
  const [urlLabel, setUrlLabel] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = useCallback(
    (file: File) => {
      setFileError(null);
      if (file.size > MAX_FILE_BYTES) {
        setFileError(`“${file.name}” is too large (max ${formatBytes(MAX_FILE_BYTES)}).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string' || !result.startsWith('data:')) {
          setFileError(`Could not read “${file.name}”.`);
          return;
        }
        onAddFile({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          dataUrl: result,
        });
      };
      reader.onerror = () => setFileError(`Could not read “${file.name}”.`);
      reader.readAsDataURL(file);
    },
    [onAddFile],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      for (let i = 0; i < files.length; i++) {
        readFileAsDataUrl(files[i]);
      }
    },
    [readFileAsDataUrl],
  );

  const onSubmitUrl = (e: FormEvent) => {
    e.preventDefault();
    if (!urlValue.trim()) return;
    onAddUrl(urlLabel, urlValue);
    setUrlLabel('');
    setUrlValue('');
  };

  return (
    <div
      className={
        isSidebar
          ? 'box-border flex w-full max-w-full min-w-0 flex-col gap-3 overflow-x-hidden animate-fade-in'
          : 'flex flex-col gap-5 p-5 sm:p-6 max-w-2xl mx-auto w-full animate-fade-in'
      }
    >
      <div className={isSidebar ? 'min-w-0 max-w-full' : undefined}>
        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">
          Files
        </p>
        {isSidebar ? (
          <p className="text-[10px] text-ink-muted leading-snug mb-2 break-words">
            Browser only — max {formatBytes(MAX_FILE_BYTES)} per file.
          </p>
        ) : (
          <p className="text-[10px] text-ink-secondary leading-snug mb-3">
            Drop reference files (specs, mockups, notes). Stored in this browser only; keep under{' '}
            {formatBytes(MAX_FILE_BYTES)} each for local storage.
          </p>
        )}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors box-border min-w-0 max-w-full ${
            isSidebar ? 'px-2 py-5' : 'px-6 py-12'
          } ${
            dragActive
              ? 'border-accent bg-accent-light'
              : 'border-rule hover:border-rule-strong hover:bg-surface-raised'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            aria-label="Choose files to add"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <p
            className={`font-semibold text-ink break-words hyphens-auto ${isSidebar ? 'text-[10px]' : 'text-[10px]'}`}
          >
            Drop files or click to browse
          </p>
          <p className={`text-ink-muted mt-1 break-words ${isSidebar ? 'text-[10px]' : 'text-[10px]'}`}>
            PDF, images, text, JSON…
          </p>
        </div>
        {fileError && (
          <p className="text-[10px] text-red-600 mt-2" role="alert">
            {fileError}
          </p>
        )}
      </div>

      <div className={isSidebar ? 'min-w-0 max-w-full' : undefined}>
        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2">
          Links
        </p>
        <form
          onSubmit={onSubmitUrl}
          className={
            isSidebar
              ? 'flex flex-col gap-2 w-full min-w-0 max-w-full'
              : 'flex flex-col sm:flex-row gap-2 sm:items-end'
          }
        >
          <div className="flex-1 min-w-0 max-w-full space-y-1">
            <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider block">
              Label
            </label>
            <input
              type="text"
              value={urlLabel}
              onChange={(e) => setUrlLabel(e.target.value)}
              placeholder="e.g. API docs"
              className="w-full min-w-0 max-w-full border border-rule bg-surface px-2.5 py-1.5 text-[10px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 box-border"
            />
          </div>
          <div className="flex-[2] min-w-0 max-w-full space-y-1">
            <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider block">
              URL
            </label>
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://…"
              className="w-full min-w-0 max-w-full border border-rule bg-surface px-2.5 py-1.5 text-[10px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 box-border"
            />
          </div>
          <button
            type="submit"
            className={`border border-rule bg-surface px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-secondary transition-colors hover:border-rule-strong hover:bg-surface-raised hover:text-ink box-border ${
              isSidebar ? 'w-full max-w-full' : 'shrink-0 sm:mb-px'
            }`}
          >
            Add link
          </button>
        </form>
      </div>

      <div className={isSidebar ? 'flex min-w-0 max-w-full flex-col' : undefined}>
        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2 break-words">
          Your resources ({resources.length})
        </p>
        {resources.length === 0 ? (
          <p className="text-[10px] text-ink-faint py-6 text-center border border-rule rounded-lg bg-surface-raised/50 break-words px-2">
            No resources yet. Add links or drop files above.
          </p>
        ) : (
          <ul
            className={`min-w-0 max-w-full divide-y divide-rule rounded-lg border border-rule bg-surface ${
              isSidebar ? 'overflow-x-hidden' : ''
            }`}
          >
            {resources.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-2 min-w-0 max-w-full px-2.5 py-2.5 hover:bg-surface-raised/80 transition-colors box-border"
              >
                <div className="min-w-0 flex-1 overflow-hidden">
                  {r.kind === 'url' ? (
                    <>
                      <p className="text-[10px] font-bold text-ink truncate max-w-full">{r.label}</p>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-accent hover:underline break-all [overflow-wrap:anywhere] block max-w-full"
                      >
                        {r.url}
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold text-ink truncate max-w-full">{r.fileName}</p>
                      <p className="text-[10px] text-ink-muted break-all">
                        {r.mimeType || 'file'} · {formatBytes(r.sizeBytes)}
                      </p>
                      <a
                        href={r.dataUrl}
                        download={r.fileName}
                        className="text-[10px] text-accent hover:underline inline-block mt-0.5 max-w-full break-all"
                      >
                        Download
                      </a>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(r.id)}
                  className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-ink-faint hover:text-ink py-1 whitespace-nowrap"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
