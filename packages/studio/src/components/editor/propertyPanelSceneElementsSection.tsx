import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { Layers } from "../../icons/SystemIcons";
import {
  collectDomEditLayerItems,
  getDomEditLayerKey,
  resolveDomEditSelection,
  type DomEditLayerItem,
  type DomEditSelection,
} from "./domEditing";
import { Section } from "./propertyPanelPrimitives";

const TAG_LABELS: Record<string, string> = {
  video: "Vi",
  img: "Im",
  canvas: "Cn",
  svg: "Sv",
  div: "Di",
  section: "Se",
  span: "Sp",
  p: "P",
  h1: "H1",
  h2: "H2",
  h3: "H3",
};

function tagBadge(tagName: string): string {
  return TAG_LABELS[tagName] ?? tagName.slice(0, 2).toUpperCase();
}

function getLayerZIndex(layer: DomEditLayerItem): number {
  const value = layer.element.ownerDocument.defaultView?.getComputedStyle(layer.element).zIndex;
  if (!value || value === "auto") return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortSceneLayers(layers: DomEditLayerItem[]): DomEditLayerItem[] {
  return [...layers].sort((a, b) => {
    const zDiff = getLayerZIndex(b) - getLayerZIndex(a);
    if (zDiff !== 0) return zDiff;
    return a.depth - b.depth;
  });
}

function resolveSceneRoot(element: DomEditSelection, iframe: HTMLIFrameElement | null) {
  const doc = iframe?.contentDocument;
  if (!doc) return null;
  if (element.element.isConnected) {
    const currentScene = element.element.closest<HTMLElement>("[data-composition-id]");
    if (currentScene) return currentScene;
  }
  return doc.querySelector<HTMLElement>("[data-composition-id]") ?? doc.documentElement;
}

export function SceneElementsSection({
  element,
  activeCompPath,
  previewIframeRef,
  onSelectElement,
}: {
  element: DomEditSelection;
  activeCompPath: string | null;
  previewIframeRef?: RefObject<HTMLIFrameElement | null>;
  onSelectElement?: (selection: DomEditSelection) => void;
}) {
  const [layers, setLayers] = useState<DomEditLayerItem[]>([]);
  const isMasterView = !activeCompPath || activeCompPath === "index.html";
  const selectedKey = useMemo(() => getDomEditLayerKey(element), [element]);

  const collectLayers = useCallback(() => {
    const root = resolveSceneRoot(element, previewIframeRef?.current ?? null);
    if (!root) {
      setLayers([]);
      return;
    }
    const next = collectDomEditLayerItems(root, {
      activeCompositionPath: activeCompPath,
      isMasterView,
    });
    setLayers(sortSceneLayers(next).slice(0, 14));
  }, [activeCompPath, element, isMasterView, previewIframeRef]);

  useEffect(() => {
    collectLayers();
  }, [collectLayers]);

  useEffect(() => {
    const iframe = previewIframeRef?.current;
    if (!iframe) return;
    iframe.addEventListener("load", collectLayers);
    return () => iframe.removeEventListener("load", collectLayers);
  }, [collectLayers, previewIframeRef]);

  if (layers.length <= 1) return null;

  const handleSelect = async (layer: DomEditLayerItem) => {
    const selection = await resolveDomEditSelection(layer.element, {
      activeCompositionPath: activeCompPath,
      isMasterView,
      preferClipAncestor: false,
    });
    if (selection) onSelectElement?.(selection);
  };

  return (
    <Section title="Scene Elements" icon={<Layers size={15} />}>
      <div className="grid gap-1">
        {layers.map((layer) => {
          const selected = layer.key === selectedKey;
          return (
            <button
              key={layer.key}
              type="button"
              onClick={() => void handleSelect(layer)}
              className={`grid min-w-0 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                selected
                  ? "bg-panel-accent/14 text-panel-accent"
                  : "text-panel-text-2 hover:bg-panel-hover hover:text-panel-text-1"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-[8px] font-bold uppercase ${
                  selected ? "bg-panel-accent/18 text-panel-accent" : "bg-panel-input"
                }`}
              >
                {tagBadge(layer.tagName)}
              </span>
              <span className="min-w-0 truncate text-[11px] font-medium">{layer.label}</span>
              {layer.tagName === "video" || layer.tagName === "img" ? (
                <span className="rounded bg-panel-input px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-panel-text-4">
                  media
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </Section>
  );
}
