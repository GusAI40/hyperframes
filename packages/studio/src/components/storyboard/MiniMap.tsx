import { memo, useCallback, useMemo, useRef } from "react";

interface MiniMapCard {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  isSelected: boolean;
}

interface MiniMapProps {
  cards: MiniMapCard[];
  viewport: { zoom: number; panX: number; panY: number };
  containerWidth: number;
  containerHeight: number;
  onJumpTo: (panX: number, panY: number) => void;
}

const MAP_WIDTH = 180;
const MAP_HEIGHT = 100;
const MAP_MARGIN = 16;

export const MiniMap = memo(function MiniMap({
  cards,
  viewport,
  containerWidth,
  containerHeight,
  onJumpTo,
}: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Compute canvas bounding box from all cards.
  const canvasBounds = useMemo(() => {
    if (cards.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
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
    // Add padding
    const pad = 100;
    return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
  }, [cards]);

  const canvasWidth = canvasBounds.maxX - canvasBounds.minX;
  const canvasHeight = canvasBounds.maxY - canvasBounds.minY;
  const scaleX = MAP_WIDTH / canvasWidth;
  const scaleY = MAP_HEIGHT / canvasHeight;
  const scale = Math.min(scaleX, scaleY);

  // Viewport rectangle in minimap space.
  const viewRect = useMemo(() => {
    const vx = (-viewport.panX / viewport.zoom - canvasBounds.minX) * scale;
    const vy = (-viewport.panY / viewport.zoom - canvasBounds.minY) * scale;
    const vw = (containerWidth / viewport.zoom) * scale;
    const vh = (containerHeight / viewport.zoom) * scale;
    return { x: vx, y: vy, w: vw, h: vh };
  }, [viewport, containerWidth, containerHeight, scale, canvasBounds]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const map = mapRef.current;
      if (!map) return;
      const rect = map.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Convert click to canvas coordinates, then to pan offset.
      const canvasX = mx / scale + canvasBounds.minX;
      const canvasY = my / scale + canvasBounds.minY;
      const newPanX = -(canvasX - containerWidth / (2 * viewport.zoom)) * viewport.zoom;
      const newPanY = -(canvasY - containerHeight / (2 * viewport.zoom)) * viewport.zoom;
      onJumpTo(newPanX, newPanY);
    },
    [scale, canvasBounds, containerWidth, containerHeight, viewport.zoom, onJumpTo],
  );

  return (
    <div
      ref={mapRef}
      className="absolute rounded-lg border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm cursor-crosshair overflow-hidden"
      style={{
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        right: MAP_MARGIN,
        bottom: MAP_MARGIN,
      }}
      onClick={handleClick}
    >
      {/* Card rectangles */}
      {cards.map((c) => (
        <div
          key={c.id}
          className={`absolute rounded-sm ${c.isSelected ? "bg-blue-500/60" : "bg-neutral-600/60"}`}
          style={{
            left: (c.x - canvasBounds.minX) * scale,
            top: (c.y - canvasBounds.minY) * scale,
            width: Math.max(2, c.width * scale),
            height: Math.max(1, c.height * scale),
          }}
        />
      ))}

      {/* Viewport rectangle */}
      <div
        className="absolute border border-white/40 rounded-sm pointer-events-none"
        style={{
          left: viewRect.x,
          top: viewRect.y,
          width: viewRect.w,
          height: viewRect.h,
        }}
      />
    </div>
  );
});
