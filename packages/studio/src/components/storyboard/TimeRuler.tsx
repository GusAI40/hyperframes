import { memo, useMemo } from "react";

interface TimeRulerProps {
  duration: number;
  pixelsPerSecond: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const TimeRuler = memo(function TimeRuler({ duration, pixelsPerSecond }: TimeRulerProps) {
  const markers = useMemo(() => {
    // Pick an interval that keeps markers from crowding.
    // At 160px/s the default 1s interval means one tick every 160px — comfortable.
    // If pixelsPerSecond shrinks (user zoomed out), widen the interval.
    const minPixelGap = 80;
    const raw = minPixelGap / pixelsPerSecond;
    // Snap to a "nice" interval: 0.5, 1, 2, 5, 10, 15, 30, 60, …
    const nice = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    const interval = nice.find((n) => n >= raw) ?? Math.ceil(raw / 60) * 60;

    const result: Array<{ time: number; x: number }> = [];
    for (let t = 0; t <= duration + interval; t += interval) {
      result.push({ time: t, x: t * pixelsPerSecond });
    }
    return result;
  }, [duration, pixelsPerSecond]);

  const width = (duration + 2) * pixelsPerSecond;

  return (
    <div className="absolute top-0 left-0 h-7 select-none pointer-events-none" style={{ width }}>
      <div className="relative h-full bg-neutral-900/80 border-b border-neutral-800/50">
        {markers.map((m) => (
          <div
            key={m.time}
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: m.x }}
          >
            <span className="text-[10px] font-mono text-neutral-600 leading-7 px-1 whitespace-nowrap">
              {formatTime(m.time)}
            </span>
            <div className="absolute bottom-0 w-px h-1.5 bg-neutral-700" />
          </div>
        ))}
      </div>
    </div>
  );
});
