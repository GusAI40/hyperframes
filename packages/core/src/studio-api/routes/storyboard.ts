import type { Hono } from "hono";
import type { StudioApiAdapter } from "../types.js";

export function registerStoryboardRoutes(app: Hono, _adapter: StudioApiAdapter): void {
  app.get("/storyboard", async (c) => {
    // Returns the storyboard state — for now, just echo the timeline elements.
    // This will be expanded in later phases with canvas positions, annotations, etc.
    return c.json({ version: 1, cards: [] });
  });
}
