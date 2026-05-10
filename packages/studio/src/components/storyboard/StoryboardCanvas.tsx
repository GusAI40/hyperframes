import { memo, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { StoryboardCard } from "./StoryboardCard";
import { MiniMap } from "./MiniMap";
import { TimeRuler } from "./TimeRuler";

// ── Constants ───────────────────────────────────────────────────────────────

const PPS = 160; // pixels per second
const CARD_WIDTH = 320;
const CARD_HEIGHT = 180;
const CARD_GAP_Y = 24;
const CARD_Y_OFFSET = 40; // below the time ruler
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 1.5;

// ── Types ───────────────────────────────────────────────────────────────────

interface StoryboardComposition {
  id: string;
  path: string;
  title: string;
  start: number;
  duration: number;
}

export interface StoryboardCanvasProps {
  projectId: string;
  compositions: StoryboardComposition[];
  selectedId: string | null;
  onSelectComposition: (id: string, path: string) => void;
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
}

// ── Layout: assign cards to non-overlapping tracks ──────────────────────────

interface LayoutCard extends StoryboardComposition {
  x: number;
  y: number;
  width: number;
  height: number;
}

function layoutCards(compositions: StoryboardComposition[]): LayoutCard[] {
  // Sort by start time so greedy track assignment works correctly.
  const sorted = [...compositions].sort((a, b) => a.start - b.start);

  // Each "track" records where its last card ends (in pixels).
  const trackEnds: number[] = [];

  return sorted.map((comp) => {
    const x = comp.start * PPS;
    const right = (comp.start + comp.duration) * PPS;

    // Find the first track where this card doesn't overlap.
    let track = trackEnds.findIndex((end) => x >= end + 12); // 12px gap
    if (track === -1) {
      track = trackEnds.length;
      trackEnds.push(0);
    }
    trackEnds[track] = right;

    const y = CARD_Y_OFFSET + track * (CARD_HEIGHT + CARD_GAP_Y);

    return {
      ...comp,
      x,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };
  });
}

// ── Component ───────────────────────────────────────────────────────────────

export const StoryboardCanvas = memo(function StoryboardCanvas({
  projectId,
  compositions,
  selectedId,
  onSelectComposition,
  currentTime,
  totalDuration,
}: StoryboardCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Space-bar panning state.
  const [spaceHeld, setSpaceHeld] = useState(false);
  const panDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Derived layout ──────────────────────────────────────────────────────

  const cards = useMemo(() => layoutCards(compositions), [compositions]);

  // ── Zoom helper ─────────────────────────────────────────────────────────

  const clampZoom = useCallback((z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)), []);

  const zoomAtCursor = useCallback(
    (newZoom: number, clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;

      setZoom((prevZoom) => {
        const clamped = clampZoom(newZoom);
        const ratio = clamped / prevZoom;
        setPanX((px) => cx - ratio * (cx - px));
        setPanY((py) => cy - ratio * (cy - py));
        return clamped;
      });
    },
    [clampZoom],
  );

  // ── Wheel handler ───────────────────────────────────────────────────────

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom (Ctrl+wheel or pinch-to-zoom).
        const factor = e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP;
        zoomAtCursor(zoom * factor, e.clientX, e.clientY);
        return;
      }

      if (e.shiftKey) {
        // Horizontal pan.
        setPanX((px) => px - e.deltaY);
      } else {
        // Vertical pan.
        setPanY((py) => py - e.deltaY);
        setPanX((px) => px - e.deltaX);
      }
    },
    [zoom, zoomAtCursor],
  );

  // ── Pointer handlers (space-drag + middle-click pan) ────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 1 || (spaceHeld && e.button === 0)) {
        e.preventDefault();
        panDragRef.current = {
          active: true,
          startX: e.clientX,
          startY: e.clientY,
          startPanX: panX,
          startPanY: panY,
        };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [spaceHeld, panX, panY],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = panDragRef.current;
    if (!drag?.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setPanX(drag.startPanX + dx);
    setPanY(drag.startPanY + dy);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (panDragRef.current?.active) {
      panDragRef.current = null;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        // Don't capture space if focus is in an input.
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }

      const modKey = e.ctrlKey || e.metaKey;

      if (modKey && e.key === "0") {
        e.preventDefault();
        fitAll();
        return;
      }

      if (modKey && e.key === "1") {
        e.preventDefault();
        setZoom(1);
        return;
      }

      if (e.key === "Escape") {
        onSelectComposition("", "");
        return;
      }

      // Arrow-key card navigation.
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        navigateCards(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpaceHeld(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compositions, selectedId]);

  // ── Fit all cards into view ─────────────────────────────────────────────

  const fitAll = useCallback(() => {
    const container = containerRef.current;
    if (!container || cards.length === 0) return;

    const rect = container.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const c of cards) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
    }

    const pad = 60;
    const contentW = maxX - minX + pad * 2;
    const contentH = maxY - minY + pad * 2;
    const fitZoom = clampZoom(Math.min(rect.width / contentW, rect.height / contentH));

    setZoom(fitZoom);
    setPanX((rect.width - contentW * fitZoom) / 2 - minX * fitZoom + pad * fitZoom);
    setPanY((rect.height - contentH * fitZoom) / 2 - minY * fitZoom + pad * fitZoom);
  }, [cards, clampZoom]);

  // ── Arrow navigation ────────────────────────────────────────────────────

  const navigateCards = useCallback(
    (direction: string) => {
      if (cards.length === 0) return;
      const currentIdx = cards.findIndex((c) => c.id === selectedId);

      let nextIdx: number;
      if (currentIdx === -1) {
        nextIdx = 0;
      } else if (direction === "ArrowRight") {
        nextIdx = Math.min(currentIdx + 1, cards.length - 1);
      } else if (direction === "ArrowLeft") {
        nextIdx = Math.max(currentIdx - 1, 0);
      } else {
        // Up/Down: find the nearest card in an adjacent track.
        const current = cards[currentIdx]!;
        const dy = direction === "ArrowDown" ? 1 : -1;
        const targetY = current.y + dy * (CARD_HEIGHT + CARD_GAP_Y);
        let best = currentIdx;
        let bestDist = Infinity;
        for (let i = 0; i < cards.length; i++) {
          const c = cards[i]!;
          if (Math.abs(c.y - targetY) < CARD_GAP_Y) {
            const dist = Math.abs(c.x - current.x);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          }
        }
        nextIdx = best;
      }

      const next = cards[nextIdx];
      if (next) onSelectComposition(next.id, next.path);
    },
    [cards, selectedId, onSelectComposition],
  );

  // ── Container dimensions for minimap ────────────────────────────────────

  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Minimap jump-to ─────────────────────────────────────────────────────

  const handleMiniMapJump = useCallback((px: number, py: number) => {
    setPanX(px);
    setPanY(py);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  const miniMapCards = useMemo(
    () =>
      cards.map((c) => ({
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        id: c.id,
        isSelected: c.id === selectedId,
      })),
    [cards, selectedId],
  );

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-neutral-950 ${
        spaceHeld ? "cursor-grab" : ""
      } ${panDragRef.current?.active ? "cursor-grabbing" : ""}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`,
        }}
      />

      {/* Canvas content layer */}
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {/* Time ruler */}
        <TimeRuler duration={totalDuration} pixelsPerSecond={PPS} />

        {/* Composition cards */}
        {cards.map((card) => {
          const isCurrent = currentTime >= card.start && currentTime < card.start + card.duration;
          const progress = isCurrent ? ((currentTime - card.start) / card.duration) * 100 : 0;

          return (
            <StoryboardCard
              key={card.id}
              id={card.id}
              path={card.path}
              title={card.title}
              start={card.start}
              duration={card.duration}
              x={card.x}
              y={card.y}
              width={card.width}
              height={card.height}
              isSelected={card.id === selectedId}
              isCurrent={isCurrent}
              projectId={projectId}
              zoom={zoom}
              progress={progress}
              onClick={() => onSelectComposition(card.id, card.path)}
            />
          );
        })}
      </div>

      {/* MiniMap overlay (bottom-right) */}
      <MiniMap
        cards={miniMapCards}
        viewport={{ zoom, panX, panY }}
        containerWidth={containerSize.w}
        containerHeight={containerSize.h}
        onJumpTo={handleMiniMapJump}
      />

      {/* Zoom controls (bottom-left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-xl bg-neutral-900/90 border border-neutral-800 px-2 py-1">
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z / ZOOM_STEP))}
          className="h-6 w-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm"
          aria-label="Zoom out"
        >
          &minus;
        </button>
        <span className="text-[10px] text-neutral-400 w-10 text-center tabular-nums select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z * ZOOM_STEP))}
          className="h-6 w-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm"
          aria-label="Zoom in"
        >
          +
        </button>
        <div className="mx-0.5 h-3 w-px bg-neutral-700" />
        <button
          type="button"
          onClick={fitAll}
          className="h-6 px-1.5 flex items-center justify-center rounded-md text-[10px] text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Fit all"
        >
          Fit
        </button>
      </div>
    </div>
  );
});
