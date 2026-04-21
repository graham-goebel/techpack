import { strToU8, zipSync } from 'fflate';
import type { ProjectFileResource, ProjectResource } from '../types';

function dataUrlToUint8Array(dataUrl: string): Uint8Array | null {
  if (!dataUrl.startsWith('data:')) return null;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const header = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  if (/;base64/i.test(header)) {
    try {
      const binary = atob(payload);
      const out = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
      return out;
    } catch {
      return null;
    }
  }
  try {
    const decoded = decodeURIComponent(payload.replace(/\+/g, ' '));
    return strToU8(decoded);
  } catch {
    return null;
  }
}

/** Safe single-segment filename for zip entries (no path traversal). */
function sanitizeAssetFileName(name: string): string {
  const base = name.replace(/[/\\]/g, '_').replace(/\.\./g, '_').trim() || 'file';
  return base.slice(0, 200);
}

function uniqueAssetName(used: Map<string, number>, fileName: string): string {
  const safe = sanitizeAssetFileName(fileName);
  const n = (used.get(safe) ?? 0) + 1;
  used.set(safe, n);
  if (n === 1) return safe;
  const dot = safe.lastIndexOf('.');
  if (dot > 0) {
    return `${safe.slice(0, dot)} (${n})${safe.slice(dot)}`;
  }
  return `${safe} (${n})`;
}

export interface PromptBundleInput {
  projectName: string;
  promptMarkdown: string;
  resources: ProjectResource[];
}

/**
 * Builds a zip containing `prompt.md` and an `assets/` folder with all file attachments.
 * URL resources are listed in `links.md` so the bundle stays useful without the app.
 */
export function buildPromptBundleZip(input: PromptBundleInput): Uint8Array {
  const files: Record<string, Uint8Array> = {
    'prompt.md': strToU8(input.promptMarkdown || ''),
  };

  const used = new Map<string, number>();
  for (const r of input.resources) {
    if (r.kind !== 'file') continue;
    const data = dataUrlToUint8Array((r as ProjectFileResource).dataUrl);
    if (!data) continue;
    const entry = `assets/${uniqueAssetName(used, r.fileName)}`;
    files[entry] = data;
  }

  const urlRows = input.resources
    .filter((r): r is Extract<ProjectResource, { kind: 'url' }> => r.kind === 'url')
    .map((r) => `- **${r.label}**: ${r.url}`);
  if (urlRows.length > 0) {
    const body = ['# Resource links', '', ...urlRows, ''].join('\n');
    files['links.md'] = strToU8(body);
  }

  return zipSync(files, { level: 6 });
}

export function downloadUint8ArrayAsFile(data: Uint8Array, fileName: string): void {
  const copy = new Uint8Array(data);
  const blob = new Blob([copy], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(url);
}

function slugifyForFile(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'project';
}

export function defaultPromptBundleFileName(projectName: string): string {
  return `${slugifyForFile(projectName)}-prompt-bundle.zip`;
}
