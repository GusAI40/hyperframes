import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import {
  HF_LOOK_COLOR_SPACE,
  HF_LOOK_PRESETS,
  isHfLookActive,
  normalizeHfLook,
  serializeHfLook,
  type HfLookAdjustKey,
  type HfLookTarget,
  type NormalizedHfLook,
} from "@hyperframes/core/color-looks";
import { HF_BUILTIN_CUBE_LUTS, getBuiltinCubeLutSrc } from "@hyperframes/core/color-luts";
import { Compare, Minus, Palette, Plus, RotateCcw } from "../../icons/SystemIcons";
import { LUT_EXT } from "../../utils/mediaTypes";
import type { DomEditSelection } from "./domEditing";
import { LABEL } from "./propertyPanelHelpers";
import { Section } from "./propertyPanelPrimitives";

const DEFAULT_ADJUST: Record<HfLookAdjustKey, number> = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
};

const DEFAULT_LOOK: NormalizedHfLook = {
  enabled: true,
  preset: "neutral",
  intensity: 1,
  adjust: DEFAULT_ADJUST,
  lut: null,
  colorSpace: HF_LOOK_COLOR_SPACE,
};

interface LookCompareState {
  enabled: boolean;
}

const DEFAULT_COMPARE: LookCompareState = {
  enabled: false,
};

const LUT_UPLOAD_DIR = "assets/luts";
const SLIDER_THUMB_SIZE = 14;
const SLIDER_THUMB_RADIUS = SLIDER_THUMB_SIZE / 2;
const BUILTIN_FILTERS_BY_SRC = new Map(
  HF_BUILTIN_CUBE_LUTS.map((filter) => [getBuiltinCubeLutSrc(filter.id), filter]),
);

type RuntimeLookStatusState = "missing" | "inactive" | "pending" | "active" | "unavailable";

interface RuntimeLookStatus {
  state: RuntimeLookStatusState;
  message: string;
}

type RuntimeLookWindow = Window & {
  __hf?: {
    colorLooks?: {
      getStatus?: (target: HfLookTarget | string | null | undefined) => RuntimeLookStatus;
    };
  };
};

const SLIDERS: Array<{
  key: HfLookAdjustKey;
  label: string;
  min: number;
  max: number;
  step: number;
  scale: number;
  suffix: string;
}> = [
  { key: "exposure", label: "Exposure", min: -200, max: 200, step: 5, scale: 100, suffix: "" },
  { key: "contrast", label: "Contrast", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
  {
    key: "highlights",
    label: "Highlights",
    min: -100,
    max: 100,
    step: 1,
    scale: 100,
    suffix: "%",
  },
  { key: "shadows", label: "Shadows", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
  { key: "whites", label: "Whites", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
  { key: "blacks", label: "Blacks", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
  { key: "temperature", label: "Warmth", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
  { key: "tint", label: "Tint", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
  { key: "saturation", label: "Saturation", min: -100, max: 100, step: 1, scale: 100, suffix: "%" },
];

export function isLookCapableElement(element: DomEditSelection): boolean {
  return element.tagName === "video" || element.tagName === "img";
}

function readLookFromElement(element: DomEditSelection): NormalizedHfLook {
  const look = normalizeHfLook(element.dataAttributes["hf-look"]) ?? DEFAULT_LOOK;
  return { ...look, intensity: 1 };
}

function toBridgeLook(look: NormalizedHfLook): unknown {
  if (!isHfLookActive(look)) return null;
  return {
    preset: look.preset,
    intensity: look.intensity,
    adjust: look.adjust,
    lut: look.lut,
    colorSpace: look.colorSpace,
  };
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatExposure(value: number): string {
  const stops = value / 100;
  return `${stops > 0 ? "+" : ""}${stops.toFixed(2)}`;
}

function fileLabel(path: string): string {
  return path.split("/").pop() ?? path;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function formatNumericInput(value: number, scale: number): string {
  const scaled = value / scale;
  return scale === 100 ? scaled.toFixed(2) : String(Math.round(scaled));
}

function parseNumericInput(value: string, scale: number): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed * scale;
}

function buildSliderTicks(min: number, max: number, neutral: number): number[] {
  const span = max - min;
  if (span <= 0) return [];
  const step = span <= 200 ? 25 : span / 4;
  const ticks = new Set<number>([min, max, neutral]);
  for (let value = min; value <= max + step / 2; value += step) {
    ticks.add(Math.round(value));
  }
  return Array.from(ticks).sort((a, b) => a - b);
}

function tickPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function isMajorTick(value: number, min: number, max: number, neutral: number): boolean {
  if (value === min || value === max || value === neutral) return true;
  const magnitude = Math.abs(value);
  return magnitude > 0 && magnitude % 50 === 0;
}

function snapSliderValue(
  value: number,
  ticks: number[],
  min: number,
  max: number,
  step: number,
): number {
  const clamped = clampNumber(value, min, max);
  const snapDistance = Math.max(step * 2, (max - min) * 0.02);
  const closestTick = ticks.reduce<{ value: number; distance: number } | null>((closest, tick) => {
    const distance = Math.abs(clamped - tick);
    if (distance > snapDistance) return closest;
    if (!closest || distance < closest.distance) return { value: tick, distance };
    return closest;
  }, null);
  return closestTick ? closestTick.value : clamped;
}

function readRuntimeLookStatus(
  iframe: HTMLIFrameElement | null | undefined,
  target: HfLookTarget,
): RuntimeLookStatus {
  try {
    const win = iframe?.contentWindow as RuntimeLookWindow | null | undefined;
    const status = win?.__hf?.colorLooks?.getStatus?.(target);
    return status ?? { state: "pending", message: "Waiting for runtime" };
  } catch {
    return { state: "unavailable", message: "Preview unavailable" };
  }
}

function StatusPill({ status }: { status: RuntimeLookStatus }) {
  const dotClass =
    status.state === "active"
      ? "bg-emerald-400"
      : status.state === "pending"
        ? "bg-amber-300"
        : status.state === "unavailable"
          ? "bg-red-400"
          : "bg-panel-text-5";
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded bg-panel-input px-2 py-1 text-[10px] font-medium text-panel-text-3">
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotClass}`} />
      <span className="truncate">{status.message}</span>
    </div>
  );
}

function LookSliderControl({
  label,
  value,
  min,
  max,
  step,
  neutral = min,
  scale = 1,
  suffix = "",
  displayValue,
  disabled,
  onCommit,
  onReset,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  neutral?: number;
  scale?: number;
  suffix?: string;
  displayValue: string;
  disabled?: boolean;
  onCommit: (nextValue: number) => void;
  onReset?: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [inputDraft, setInputDraft] = useState(() => formatNumericInput(value, scale));
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  const draftRef = useRef(value);
  valueRef.current = value;
  draftRef.current = draft;

  useEffect(() => {
    setDraft(value);
    draftRef.current = value;
    setInputDraft(formatNumericInput(value, scale));
  }, [scale, value]);

  useEffect(
    () => () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    },
    [],
  );

  const clampDraft = useCallback(
    (nextValue: number) => clampNumber(nextValue, min, max),
    [max, min],
  );

  const commitDraft = useCallback(
    (nextValue: number) => {
      const clamped = clampDraft(nextValue);
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
      setDraft(clamped);
      draftRef.current = clamped;
      setInputDraft(formatNumericInput(clamped, scale));
      if (clamped !== valueRef.current) onCommit(clamped);
    },
    [clampDraft, onCommit, scale],
  );

  const scheduleCommit = useCallback(
    (nextValue: number) => {
      const clamped = clampDraft(nextValue);
      setDraft(clamped);
      draftRef.current = clamped;
      setInputDraft(formatNumericInput(clamped, scale));
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
      commitTimerRef.current = setTimeout(() => {
        if (clamped !== valueRef.current) onCommit(clamped);
      }, 40);
    },
    [clampDraft, onCommit, scale],
  );

  const commitInputDraft = useCallback(() => {
    const parsed = parseNumericInput(inputDraft, scale);
    if (parsed === null) {
      setInputDraft(formatNumericInput(draft, scale));
      return;
    }
    commitDraft(parsed);
  }, [commitDraft, draft, inputDraft, scale]);

  const nudge = useCallback(
    (direction: -1 | 1) => {
      commitDraft(draftRef.current + step * direction);
    },
    [commitDraft, step],
  );

  const range = max - min;
  const valuePercent = range === 0 ? 0 : ((draft - min) / range) * 100;
  const neutralPercent = range === 0 ? 0 : ((neutral - min) / range) * 100;
  const fillLeft = Math.min(valuePercent, neutralPercent);
  const fillWidth = Math.abs(valuePercent - neutralPercent);
  const ticks = buildSliderTicks(min, max, neutral);
  const snapDraft = (nextValue: number) => snapSliderValue(nextValue, ticks, min, max, step);

  return (
    <div className="grid min-w-0 gap-1.5 rounded-md bg-panel-input/30 p-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`${LABEL} min-w-0 flex-1 truncate`}>{label}</span>
        <div className="flex flex-shrink-0 items-center gap-1 rounded bg-panel-input px-1.5 py-0.5">
          <input
            type="number"
            value={inputDraft}
            min={min / scale}
            max={max / scale}
            step={step / scale}
            disabled={disabled}
            onChange={(event) => setInputDraft(event.currentTarget.value)}
            onBlur={commitInputDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                nudge(1);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                nudge(-1);
              }
            }}
            className="h-5 w-[42px] bg-transparent text-right text-[11px] font-medium tabular-nums text-panel-text-1 outline-none disabled:cursor-not-allowed"
            title={displayValue}
          />
          {suffix && <span className="text-[10px] text-panel-text-5">{suffix}</span>}
        </div>
        {onReset && (
          <button
            type="button"
            disabled={disabled}
            aria-label={`Reset ${label}`}
            onClick={(event) => {
              event.stopPropagation();
              onReset();
            }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-panel-text-5 transition-colors hover:bg-panel-hover hover:text-panel-text-1 disabled:cursor-not-allowed disabled:opacity-40"
            title={`Reset ${label}`}
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-[22px_minmax(0,1fr)_22px] items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          aria-label={`Decrease ${label}`}
          onClick={() => nudge(-1)}
          className="h-6 w-6 rounded text-[13px] leading-none text-panel-text-4 transition-colors hover:bg-panel-hover hover:text-panel-text-1 disabled:cursor-not-allowed disabled:opacity-40"
          title={`Decrease ${label}`}
        >
          <Minus size={11} />
        </button>
        <div className="relative h-8 min-w-0">
          <div
            data-hf-look-slider-track="true"
            className="pointer-events-none absolute inset-y-0 z-0"
            style={{ left: SLIDER_THUMB_RADIUS, right: SLIDER_THUMB_RADIUS }}
          >
            <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-panel-border" />
            <div
              className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-studio-accent"
              style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
            />
            {ticks.map((tick) => {
              const major = isMajorTick(tick, min, max, neutral);
              return (
                <div
                  key={tick}
                  data-hf-look-slider-tick="true"
                  data-major={major ? "true" : "false"}
                  className={`absolute top-1/2 w-px -translate-y-1/2 ${
                    major ? "h-3 bg-panel-text-3" : "h-1.5 bg-panel-text-5/80"
                  }`}
                  style={{ left: `${tickPercent(tick, min, max)}%` }}
                  title={String(tick / scale)}
                />
              );
            })}
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={draft}
            disabled={disabled}
            onChange={(event) => scheduleCommit(snapDraft(Number(event.currentTarget.value)))}
            onMouseUp={() => commitDraft(snapDraft(draft))}
            onTouchEnd={() => commitDraft(snapDraft(draft))}
            onBlur={() => commitDraft(snapDraft(draft))}
            className="absolute left-0 right-0 top-1/2 z-10 h-4 min-w-0 w-full -translate-y-1/2 cursor-default appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-range-track]:h-4 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:cursor-default [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_0_2px_#0C0C0E,0_1px_4px_rgba(0,0,0,0.55)] [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-default [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_#0C0C0E,0_1px_4px_rgba(0,0,0,0.55)]"
            title={displayValue}
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          aria-label={`Increase ${label}`}
          onClick={() => nudge(1)}
          className="flex h-6 w-6 items-center justify-center rounded text-panel-text-4 transition-colors hover:bg-panel-hover hover:text-panel-text-1 disabled:cursor-not-allowed disabled:opacity-40"
          title={`Increase ${label}`}
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}

function LookControls({
  look,
  assets,
  onImportAssets,
  onCommitLook,
}: {
  look: NormalizedHfLook;
  assets: string[];
  onImportAssets?: (files: FileList, dir?: string) => Promise<string[]>;
  onCommitLook: (nextLook: NormalizedHfLook) => void;
}) {
  const lutInputRef = useRef<HTMLInputElement>(null);
  const lutAssets = useMemo(
    () => assets.filter((asset) => LUT_EXT.test(asset)).sort((a, b) => a.localeCompare(b)),
    [assets],
  );
  const selectedLut = look.lut?.src ?? "";
  const selectedBuiltInFilter = BUILTIN_FILTERS_BY_SRC.get(selectedLut) ?? null;
  const selectedProjectLut = selectedLut && !selectedBuiltInFilter ? fileLabel(selectedLut) : null;

  const applyPreset = (preset: string) => {
    const next = normalizeHfLook({ preset, intensity: 1 }) ?? DEFAULT_LOOK;
    onCommitLook(next);
  };
  const applyLut = (src: string | null, intensity = 1) => {
    onCommitLook({
      ...look,
      intensity: 1,
      lut: src ? { src, intensity } : null,
    });
  };
  const updateLutIntensity = (value: number) => {
    if (!look.lut) return;
    applyLut(look.lut.src, value / 100);
  };
  const importLuts = async (files: FileList | null) => {
    if (!files?.length || !onImportAssets) return;
    const uploaded = await onImportAssets(files, LUT_UPLOAD_DIR);
    const firstLut = uploaded.find((asset) => LUT_EXT.test(asset));
    if (firstLut) applyLut(firstLut, 1);
  };

  return (
    <div className="space-y-4">
      <label className="grid min-w-0 gap-1.5">
        <span className={LABEL}>Template</span>
        <select
          value={String(look.preset ?? "neutral")}
          onChange={(event) => applyPreset(event.target.value)}
          className="w-full min-w-0 rounded-md bg-panel-input px-3 py-2 text-[11px] font-medium text-panel-text-1 outline-none"
        >
          {HF_LOOK_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid min-w-0 gap-1.5">
        <span className={LABEL}>Filter</span>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_28px] gap-2">
          <select
            value={selectedLut}
            onChange={(event) => {
              const nextSrc = event.target.value;
              applyLut(
                nextSrc || null,
                nextSrc && look.lut?.src === nextSrc ? look.lut.intensity : 1,
              );
            }}
            className="w-full min-w-0 rounded-md bg-panel-input px-3 py-2 text-[11px] font-medium text-panel-text-1 outline-none"
            title="Filter"
          >
            <option value="">None</option>
            <optgroup label="Built-in">
              {HF_BUILTIN_CUBE_LUTS.map((filter) => (
                <option key={filter.id} value={getBuiltinCubeLutSrc(filter.id)}>
                  {filter.label}
                </option>
              ))}
            </optgroup>
            {lutAssets.length > 0 && (
              <optgroup label="Project LUTs">
                {lutAssets.map((asset) => (
                  <option key={asset} value={asset}>
                    {fileLabel(asset)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <button
            type="button"
            disabled={!onImportAssets}
            onClick={(event) => {
              event.stopPropagation();
              lutInputRef.current?.click();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-panel-input text-panel-text-4 transition-colors hover:bg-panel-hover hover:text-panel-text-1 disabled:cursor-not-allowed disabled:opacity-40"
            title="Import .cube LUT"
            aria-label="Import .cube LUT"
          >
            <Plus size={13} />
          </button>
          <input
            ref={lutInputRef}
            type="file"
            accept=".cube"
            multiple
            className="hidden"
            onChange={(event) => {
              void importLuts(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
        </div>
        {look.lut && (
          <div className="grid gap-2">
            {(selectedBuiltInFilter || selectedProjectLut) && (
              <div className="flex min-w-0 items-start gap-2 text-[10px] leading-4 text-panel-text-3">
                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-studio-accent" />
                <span className="min-w-0">
                  <span className="font-medium text-panel-text-2">
                    {selectedBuiltInFilter ? "Built-in Rec.709" : "Project LUT"}
                  </span>
                  {selectedBuiltInFilter
                    ? ` · ${selectedBuiltInFilter.description}`
                    : ` · ${selectedProjectLut}`}
                </span>
              </div>
            )}
            <LookSliderControl
              label="Filter Strength"
              value={Math.round((look.lut.intensity ?? 1) * 100)}
              min={0}
              max={100}
              step={1}
              neutral={0}
              suffix="%"
              displayValue={formatPercent((look.lut.intensity ?? 1) * 100)}
              onCommit={updateLutIntensity}
              onReset={() => updateLutIntensity(100)}
            />
          </div>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3">
        {SLIDERS.map((slider) => {
          const value = look.adjust[slider.key] * slider.scale;
          const isExposure = slider.key === "exposure";
          return (
            <div
              key={slider.key}
              className={
                SLIDERS.length % 2 === 1 && slider.key === "saturation" ? "col-span-2" : ""
              }
            >
              <LookSliderControl
                label={slider.label}
                value={Math.round(value)}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                neutral={0}
                scale={isExposure ? 100 : 1}
                suffix={isExposure ? "" : slider.suffix}
                displayValue={isExposure ? formatExposure(value) : formatPercent(value)}
                onCommit={(next) => {
                  onCommitLook({
                    ...look,
                    intensity: 1,
                    adjust: {
                      ...look.adjust,
                      [slider.key]: next / slider.scale,
                    },
                  });
                }}
                onReset={() => {
                  onCommitLook({
                    ...look,
                    intensity: 1,
                    adjust: {
                      ...look.adjust,
                      [slider.key]: 0,
                    },
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HoldBeforeButton({
  active,
  disabled,
  onHoldChange,
}: {
  active: boolean;
  disabled: boolean;
  onHoldChange: (holding: boolean) => void;
}) {
  const startHold = (
    event: ReactMouseEvent<HTMLButtonElement> | ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    onHoldChange(true);
    const release = () => {
      onHoldChange(false);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("mouseup", release);
      window.removeEventListener("blur", release);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("mouseup", release);
    window.addEventListener("blur", release);
  };
  const stopHold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    onHoldChange(false);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      aria-label="Hold to show original"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerCancel={stopHold}
      onMouseDown={startHold}
      onMouseUp={() => onHoldChange(false)}
      onBlur={() => {
        if (active) onHoldChange(false);
      }}
      onKeyDown={(event) => {
        if (disabled || (event.key !== " " && event.key !== "Enter")) return;
        event.preventDefault();
        if (!active) onHoldChange(true);
      }}
      onKeyUp={(event) => {
        if (disabled || (event.key !== " " && event.key !== "Enter")) return;
        event.preventDefault();
        onHoldChange(false);
      }}
      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors ${
        active
          ? "bg-studio-accent text-black"
          : "text-panel-text-4 hover:bg-panel-hover hover:text-panel-text-1"
      } disabled:cursor-not-allowed disabled:opacity-40`}
      title="Hold to show original"
    >
      <Compare size={13} />
    </button>
  );
}

export function LooksSection({
  element,
  assets,
  previewIframeRef,
  onImportAssets,
  onSetAttributeLive,
}: {
  element: DomEditSelection;
  assets: string[];
  previewIframeRef?: RefObject<HTMLIFrameElement | null>;
  onImportAssets?: (files: FileList, dir?: string) => Promise<string[]>;
  onSetAttributeLive: (attr: string, value: string | null) => void | Promise<void>;
}) {
  const [look, setLook] = useState(() => readLookFromElement(element));
  const [compare, setCompare] = useState<LookCompareState>(DEFAULT_COMPARE);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeLookStatus>(() => ({
    state: "pending",
    message: "Waiting for runtime",
  }));
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compareRef = useRef(compare);
  compareRef.current = compare;
  const target = useMemo(
    (): HfLookTarget => ({
      id: element.id ?? null,
      hfId: element.hfId ?? null,
      selector: element.selector ?? null,
      selectorIndex: element.selectorIndex ?? null,
    }),
    [element.hfId, element.id, element.selector, element.selectorIndex],
  );
  const targetKey = useMemo(
    () =>
      [
        target.id ?? "",
        target.hfId ?? "",
        target.selector ?? "",
        String(target.selectorIndex ?? ""),
      ].join("|"),
    [target],
  );
  const lookAttribute = element.dataAttributes["hf-look"] ?? "";

  const refreshRuntimeStatus = useCallback(() => {
    setRuntimeStatus(readRuntimeLookStatus(previewIframeRef?.current, target));
  }, [previewIframeRef, target]);

  useEffect(() => {
    setLook(normalizeHfLook(lookAttribute) ?? DEFAULT_LOOK);
    refreshRuntimeStatus();
  }, [element, lookAttribute, refreshRuntimeStatus]);

  useEffect(() => {
    setCompare(DEFAULT_COMPARE);
  }, [targetKey]);

  useEffect(() => {
    const iframe = previewIframeRef?.current;
    if (!iframe) return;
    const refresh = () => {
      window.setTimeout(refreshRuntimeStatus, 50);
    };
    iframe.addEventListener("load", refresh);
    const timer = window.setTimeout(refreshRuntimeStatus, 80);
    return () => {
      iframe.removeEventListener("load", refresh);
      window.clearTimeout(timer);
    };
  }, [previewIframeRef, refreshRuntimeStatus]);

  useEffect(
    () => () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    },
    [],
  );

  const postColorLook = useCallback(
    (nextLook: NormalizedHfLook) => {
      previewIframeRef?.current?.contentWindow?.postMessage(
        {
          source: "hf-parent",
          type: "control",
          action: "set-color-look",
          target,
          look: toBridgeLook(nextLook),
        },
        "*",
      );
    },
    [previewIframeRef, target],
  );

  const postCompare = useCallback(
    (nextCompare: LookCompareState) => {
      previewIframeRef?.current?.contentWindow?.postMessage(
        {
          source: "hf-parent",
          type: "control",
          action: "set-color-look-compare",
          target,
          compare: {
            enabled: nextCompare.enabled,
            position: 1,
            lineWidth: 0,
          },
        },
        "*",
      );
    },
    [previewIframeRef, target],
  );

  useEffect(
    () => () => {
      postCompare({ ...DEFAULT_COMPARE, enabled: false });
    },
    [postCompare],
  );

  const commitLook = (nextLook: NormalizedHfLook) => {
    setLook(nextLook);
    setRuntimeStatus({ state: "pending", message: "Updating shader" });
    postColorLook(nextLook);
    const active = isHfLookActive(nextLook);
    if (compareRef.current.enabled) {
      postCompare({
        ...compareRef.current,
        enabled: active,
      });
      if (!active) setCompare(DEFAULT_COMPARE);
    }
    window.setTimeout(refreshRuntimeStatus, 50);
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      const value = isHfLookActive(nextLook) ? serializeHfLook(nextLook) : null;
      void onSetAttributeLive("hf-look", value);
    }, 350);
  };

  const resetLook = () => {
    commitLook(DEFAULT_LOOK);
  };

  const commitCompare = useCallback(
    (nextCompare: LookCompareState) => {
      const active = isHfLookActive(look);
      const normalized = {
        enabled: nextCompare.enabled && active,
      };
      setCompare(normalized);
      if (normalized.enabled) postColorLook(look);
      postCompare(normalized);
      window.setTimeout(refreshRuntimeStatus, 50);
    },
    [look, postColorLook, postCompare, refreshRuntimeStatus],
  );

  return (
    <Section
      title="Media Looks"
      icon={<Palette size={15} />}
      accessory={
        <div className="flex min-w-0 items-center gap-1.5">
          <HoldBeforeButton
            active={compare.enabled}
            disabled={!isHfLookActive(look)}
            onHoldChange={(holding) => commitCompare({ enabled: holding })}
          />
          <StatusPill status={runtimeStatus} />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              resetLook();
            }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-panel-text-4 transition-colors hover:bg-panel-hover hover:text-panel-text-1"
            title="Reset look"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      }
    >
      <LookControls
        look={look}
        assets={assets}
        onImportAssets={onImportAssets}
        onCommitLook={commitLook}
      />
    </Section>
  );
}
