import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Block, ProjectConfig, Tier } from '../../types';
import { techOptions } from '../../data/techOptions';

const NODE_W = 200;
const NODE_H = 104;
const COL_GAP = 44;
const ROW_GAP = 72;
const CANVAS_PAD = 60;

/**
 * Architecture topology — blocks grouped by layer, ordered left-to-right
 * within each row for minimal edge crossings.
 */
const LAYER_DEFS: { label: string; ids: string[] }[] = [
  { label: 'Presentation', ids: ['visual-ui', 'markup-structure', 'seo-performance'] },
  { label: 'Client', ids: ['routing', 'functionality', 'state-management'] },
  { label: 'Server', ids: ['auth', 'backend-api', 'security'] },
  { label: 'Data & Services', ids: ['database', 'file-storage', 'payments', 'email-notifications'] },
  { label: 'Operations', ids: ['env-secrets', 'hosting', 'ci-cd', 'analytics', 'testing', 'documentation', 'compliance'] },
];

/** Cross-layer connections — source feeds / is consumed by target */
const TOPOLOGY_EDGES: [string, string][] = [
  ['visual-ui', 'functionality'],
  ['markup-structure', 'functionality'],
  ['routing', 'backend-api'],
  ['functionality', 'backend-api'],
  ['state-management', 'backend-api'],
  ['backend-api', 'database'],
  ['backend-api', 'file-storage'],
  ['backend-api', 'payments'],
  ['backend-api', 'email-notifications'],
  ['auth', 'database'],
];

interface ArchitectureFlowCanvasProps {
  visibleBlocks: Block[];
  config: ProjectConfig;
  tier: Tier;
  expandedBlockId: string | null;
  onExpandToggle: (blockId: string | null) => void;
  onToggleBlock: (blockId: string) => void;
  onSetTechChoice: (blockId: string, optionId: string) => void;
}

export function ArchitectureFlowCanvas({
  visibleBlocks,
  config,
  tier,
  expandedBlockId,
  onExpandToggle,
  onToggleBlock,
  onSetTechChoice,
}: ArchitectureFlowCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: CANVAS_PAD, y: CANVAS_PAD });
  const [panning, setPanning] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  /* ── Layout computation ── */
  const layout = useMemo(() => {
    const visibleIds = new Set(visibleBlocks.map((b) => b.id));
    const blockMap = new Map(visibleBlocks.map((b) => [b.id, b]));

    const layers: Block[][] = [];
    const layerLabels: string[] = [];
    for (const def of LAYER_DEFS) {
      const row = def.ids
        .filter((id) => visibleIds.has(id))
        .map((id) => blockMap.get(id)!)
        .filter(Boolean);
      if (row.length > 0) {
        layers.push(row);
        layerLabels.push(def.label);
      }
    }

    const assigned = new Set(LAYER_DEFS.flatMap((d) => d.ids));
    const extra = visibleBlocks.filter((b) => !assigned.has(b.id));
    if (extra.length > 0) {
      layers.push(extra);
      layerLabels.push('Other');
    }

    const maxCols = Math.max(...layers.map((l) => l.length), 1);
    const canvasW = Math.max(maxCols * (NODE_W + COL_GAP) - COL_GAP + CANVAS_PAD * 2, 400);
    const canvasH = Math.max(
      layers.length * (NODE_H + ROW_GAP) - ROW_GAP + CANVAS_PAD * 2,
      300,
    );

    const positions: Record<string, { x: number; y: number }> = {};
    const layerYs: number[] = [];
    layers.forEach((row, rowIdx) => {
      const rowWidth = row.length * (NODE_W + COL_GAP) - COL_GAP;
      const startX = (canvasW - rowWidth) / 2;
      const y = CANVAS_PAD + rowIdx * (NODE_H + ROW_GAP);
      layerYs.push(y);
      row.forEach((block, colIdx) => {
        positions[block.id] = {
          x: startX + colIdx * (NODE_W + COL_GAP),
          y,
        };
      });
    });

    const activeEdges = TOPOLOGY_EDGES.filter(
      ([s, t]) => visibleIds.has(s) && visibleIds.has(t),
    );

    // Group edges by source / target for endpoint spreading
    const bySrc = new Map<string, [string, string][]>();
    const byTgt = new Map<string, [string, string][]>();
    for (const e of activeEdges) {
      if (!bySrc.has(e[0])) bySrc.set(e[0], []);
      bySrc.get(e[0])!.push(e);
      if (!byTgt.has(e[1])) byTgt.set(e[1], []);
      byTgt.get(e[1])!.push(e);
    }
    for (const edges of bySrc.values()) {
      edges.sort((a, b) => (positions[a[1]]?.x ?? 0) - (positions[b[1]]?.x ?? 0));
    }
    for (const edges of byTgt.values()) {
      edges.sort((a, b) => (positions[a[0]]?.x ?? 0) - (positions[b[0]]?.x ?? 0));
    }

    const edgePaths: { d: string; key: string }[] = [];
    for (const edge of activeEdges) {
      const [srcId, tgtId] = edge;
      const src = positions[srcId];
      const tgt = positions[tgtId];
      if (!src || !tgt) continue;

      const srcGroup = bySrc.get(srcId)!;
      const tgtGroup = byTgt.get(tgtId)!;
      const si = srcGroup.indexOf(edge);
      const ti = tgtGroup.indexOf(edge);

      const spreadOut = Math.min(NODE_W * 0.6, srcGroup.length * 24);
      const spreadIn = Math.min(NODE_W * 0.6, tgtGroup.length * 24);
      const offOut =
        srcGroup.length > 1
          ? -spreadOut / 2 + (si / (srcGroup.length - 1)) * spreadOut
          : 0;
      const offIn =
        tgtGroup.length > 1
          ? -spreadIn / 2 + (ti / (tgtGroup.length - 1)) * spreadIn
          : 0;

      const x1 = src.x + NODE_W / 2 + offOut;
      const y1 = src.y + NODE_H;
      const x2 = tgt.x + NODE_W / 2 + offIn;
      const y2 = tgt.y;
      const midY = (y1 + y2) / 2;

      edgePaths.push({
        d: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
        key: `${srcId}-${tgtId}`,
      });
    }

    return { layers, layerLabels, layerYs, positions, edgePaths, canvasW, canvasH };
  }, [visibleBlocks]);

  /* ── Fit / center view ── */
  const centerView = useCallback(() => {
    const el = wrapRef.current;
    if (!el || visibleBlocks.length === 0) {
      setScale(1);
      setPan({ x: CANVAS_PAD, y: CANVAS_PAD });
      return;
    }
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const margin = 32;
    const s = Math.min(
      1.2,
      Math.min(
        (cw - margin * 2) / layout.canvasW,
        (ch - margin * 2) / layout.canvasH,
      ),
    );
    const clamped = Math.max(0.35, Math.min(2, s));
    setScale(clamped);
    setPan({
      x: (cw - layout.canvasW * clamped) / 2,
      y: (ch - layout.canvasH * clamped) / 2,
    });
  }, [visibleBlocks.length, layout.canvasW, layout.canvasH]);

  useEffect(() => {
    const id = requestAnimationFrame(() => centerView());
    return () => cancelAnimationFrame(id);
  }, [centerView]);

  /* ── Wheel zoom ── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prev) => {
        const next = Math.min(2.5, Math.max(0.25, prev * factor));
        setPan((p) => {
          const wx = (mx - p.x) / prev;
          const wy = (my - p.y) / prev;
          return { x: mx - wx * next, y: my - wy * next };
        });
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  /* ── Keyboard zoom (+/- keys) ── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const isIn = e.key === '+' || e.key === '=';
      const isOut = e.key === '-' || e.key === '_';
      if (!isIn && !isOut) return;
      e.preventDefault();
      const factor = isIn ? 1.15 : 0.85;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      setScale((prev) => {
        const next = Math.min(2.5, Math.max(0.25, prev * factor));
        setPan((p) => {
          const wx = (cx - p.x) / prev;
          const wy = (cy - p.y) / prev;
          return { x: cx - wx * next, y: cy - wy * next };
        });
        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── Pointer drag ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-flow-node]')) return;
    if ((e.target as HTMLElement).closest('[data-flow-panel]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPanning(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panning) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (panning) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setPanning(false);
  };

  /* ── Expanded block ── */
  const expandedBlock = useMemo(
    () => visibleBlocks.find((b) => b.id === expandedBlockId) ?? null,
    [visibleBlocks, expandedBlockId],
  );

  const expandedMeta = useMemo(() => {
    if (!expandedBlock) return null;
    const status = expandedBlock.statusForTier(tier);
    const isSelected = config.selectedBlockIds.includes(expandedBlock.id);
    const chosenOptionId = config.techChoices[expandedBlock.id];
    const blockOptions = techOptions.filter((o) => o.blockId === expandedBlock.id);
    return { status, isSelected, chosenOptionId, blockOptions };
  }, [expandedBlock, tier, config]);

  if (visibleBlocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-ink-muted">
        No blocks to show.
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: panning ? 'grabbing' : 'grab' }}
    >
      {/* Controls */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            centerView();
          }}
          className="text-[9px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink border border-rule bg-white/90 backdrop-blur-sm px-2 py-1 shadow-sm"
        >
          Fit view
        </button>
        <p className="text-[8px] text-ink-faint max-w-[140px] leading-snug">
          Scroll to zoom · drag canvas to pan
        </p>
      </div>

      {/* Scaled canvas */}
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          width: layout.canvasW,
          height: layout.canvasH,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* Layer labels */}
        {layout.layerLabels.map((label, i) => (
          <div
            key={`lbl-${i}`}
            className="absolute text-[8px] font-bold text-neutral-300 uppercase tracking-[0.2em] w-full text-center pointer-events-none select-none"
            style={{ top: layout.layerYs[i] - 16 }}
          >
            {label}
          </div>
        ))}

        {/* SVG edges */}
        <svg
          width={layout.canvasW}
          height={layout.canvasH}
          className="absolute inset-0 pointer-events-none text-neutral-300"
          aria-hidden
        >
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" className="fill-neutral-300" />
            </marker>
          </defs>
          {layout.edgePaths.map(({ d, key }) => (
            <path
              key={key}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              markerEnd="url(#flow-arrow)"
            />
          ))}
        </svg>

        {/* Node cards */}
        {visibleBlocks.map((block) => {
          const pos = layout.positions[block.id];
          if (!pos) return null;
          const status = block.statusForTier(tier);
          const isSelected = config.selectedBlockIds.includes(block.id);
          const isRequired = status === 'required';
          const isExpanded = expandedBlockId === block.id;
          const chosenOptionId = config.techChoices[block.id];
          const chosenOption = techOptions.find((o) => o.id === chosenOptionId);

          return (
            <div
              key={block.id}
              data-flow-node
              className="absolute flex flex-col bg-white border border-neutral-200 shadow-sm transition-opacity"
              style={{
                left: pos.x,
                top: pos.y,
                width: NODE_W,
                minHeight: NODE_H,
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className={`flex items-center gap-2 px-2.5 py-2 border-b border-neutral-200 ${
                  isSelected ? 'bg-neutral-50' : 'bg-white'
                } ${!isSelected ? 'opacity-60' : ''}`}
              >
                {!isRequired && (
                  <button
                    type="button"
                    onClick={() => onToggleBlock(block.id)}
                    className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-ink bg-ink' : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={isSelected ? 'Included' : 'Include'}
                  >
                    {isSelected && <span className="h-1 w-1 rounded-full bg-white" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onExpandToggle(isExpanded ? null : block.id)}
                  className="flex-1 flex items-center gap-1.5 min-w-0 text-left"
                >
                  <span className="text-sm shrink-0 leading-none" aria-hidden>
                    {block.icon}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider truncate ${
                      isSelected ? 'text-ink' : 'text-neutral-400'
                    }`}
                  >
                    {block.name}
                  </span>
                </button>
                <span
                  className={`text-[7px] font-bold uppercase tracking-wider shrink-0 ${
                    status === 'required'
                      ? 'text-ink-muted'
                      : status === 'recommended'
                        ? 'text-accent'
                        : 'text-ink-faint'
                  }`}
                >
                  {status === 'required' ? 'Req' : status === 'recommended' ? 'Rec' : 'Opt'}
                </span>
              </div>
              {isSelected && (
                <button
                  type="button"
                  onClick={() => onExpandToggle(isExpanded ? null : block.id)}
                  className="w-full text-left px-2.5 py-2"
                >
                  {chosenOption ? (
                    <p className="text-[10px] font-semibold text-ink-secondary truncate">{chosenOption.name}</p>
                  ) : (
                    <p className="text-[9px] text-ink-faint italic">Choose technology →</p>
                  )}
                  <p className="text-[9px] text-ink-muted leading-snug line-clamp-2 mt-0.5">{block.summary}</p>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail / tech panel — screen-space, not scaled */}
      {expandedBlock && expandedMeta?.isSelected && (
        <div
          data-flow-panel
          className="absolute z-30 right-3 top-3 bottom-3 w-96 max-w-[calc(100%-24px)] max-h-[calc(100%-24px)] flex flex-col bg-white border border-rule shadow-md animate-fade-in pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-rule bg-surface-raised">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                {expandedBlock.icon}
              </span>
              <span className="text-[11px] font-bold text-ink truncate">{expandedBlock.name}</span>
            </div>
            <button
              type="button"
              onClick={() => onExpandToggle(null)}
              className="text-[9px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink shrink-0"
            >
              Close
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-3 py-2.5 border-b border-rule">
              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Architecture</p>
              <p className="text-[10px] text-ink-secondary leading-relaxed">
                Blocks are arranged by architectural layer — from user-facing presentation at the top to
                operations at the bottom. Arrows show data and control flow between layers.
              </p>
            </div>
            <div className="px-3 py-2.5 border-b border-rule">
              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">What is this</p>
              <p className="text-[10px] text-ink-secondary leading-relaxed">{expandedBlock.explanation}</p>
            </div>
            <div className="px-3 py-2.5 border-b border-rule">
              <p className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Why</p>
              <p className="text-[10px] text-ink-secondary leading-relaxed">{expandedBlock.whyNeeded}</p>
            </div>
            {expandedMeta.blockOptions.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100">
                  <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.12em]">Technology</span>
                </div>
                {expandedMeta.blockOptions.map((option) => {
                  const isChosen = expandedMeta.chosenOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSetTechChoice(expandedBlock.id, option.id)}
                      className={`w-full text-left px-3 py-2 border-b border-neutral-100 last:border-b-0 transition-colors ${
                        isChosen ? 'bg-ink text-white' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 border shrink-0 flex items-center justify-center ${
                            isChosen ? 'border-white/50' : 'border-ink-faint'
                          }`}
                        >
                          {isChosen && <div className="h-0.5 w-0.5 bg-white" />}
                        </div>
                        <span className="text-[10px] font-bold flex-1 truncate">{option.name}</span>
                        {option.isDefault && (
                          <span
                            className={`text-[8px] font-bold uppercase ${isChosen ? 'text-white/40' : 'text-accent'}`}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[9px] leading-snug mt-0.5 ml-4 line-clamp-2 ${
                          isChosen ? 'text-white/50' : 'text-ink-muted'
                        }`}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
