import { memo, useMemo } from "react";

interface StoryboardCardProps {
  id: string;
  path: string;
  title: string;
  start: number;
  duration: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  /** True when the playhead is within this card's time range. */
  isCurrent: boolean;
  projectId: string;
  zoom: number;
  /** Playback progress within this card's range, 0-100. */
  progress: number;
  onClick: () => void;
}

export const StoryboardCard = memo(function StoryboardCard({
  title,
  duration,
  x,
  y,
  width,
  height,
  isSelected,
  isCurrent,
  projectId,
  path,
  zoom,
  progress,
  onClick,
}: StoryboardCardProps) {
  const titleBarHeight = 32;
  const previewHeight = height - titleBarHeight;

  const iframeSrc = useMemo(
    () => `/api/projects/${projectId}/preview/comp/${path}`,
    [projectId, path],
  );

  const showPreview = zoom > 0.2;
  const iframeScale = width / 1920;

  return (
    <div
      className="absolute cursor-pointer transition-all duration-150"
      style={{ left: x, top: y, width, height }}
      onClick={onClick}
    >
      <div
        className={`h-full rounded-xl overflow-hidden border-2 transition-colors ${
          isSelected
            ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            : "border-neutral-800 hover:border-neutral-600 hover:scale-[1.02]"
        }`}
        style={{ transformOrigin: "center center" }}
      >
        {/* Preview area */}
        <div className="relative bg-neutral-900 overflow-hidden" style={{ height: previewHeight }}>
          {showPreview ? (
            <iframe
              src={iframeSrc}
              title={title}
              loading="lazy"
              style={{
                width: 1920,
                height: 1080,
                transform: `scale(${iframeScale})`,
                transformOrigin: "top left",
                border: "none",
                pointerEvents: "none",
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="h-full w-full bg-neutral-800" />
          )}

          {/* Playback progress bar */}
          {isCurrent && (
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>

        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-2 bg-neutral-900/95 border-t border-neutral-800"
          style={{ height: titleBarHeight }}
        >
          <span className="text-[10px] font-medium text-neutral-300 truncate flex-1">{title}</span>
          <span className="text-[9px] text-neutral-600 tabular-nums flex-shrink-0">
            {duration.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
});
