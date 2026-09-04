import { describe, expect, it, vi, afterEach } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

afterEach(() => { vi.unstubAllEnvs(); });

describe("machine-level extension settlement", () => {
  it("keys a set independent of order", async () => {
    const { extensionSetKey } = await import("../index.js");
    expect(extensionSetKey(["b", "a"])).toBe(extensionSetKey(["a", "b"]));
  });

  it("an answered set never prompts again; a new set does", async () => {
    const dir = mkdtempSync(join(tmpdir(), "updater-"));
    vi.stubEnv("PI_UPDATER_CACHE_DIR", dir);
    const { extensionSetKey, unsettledExtensions } = await import("../index.js");
    writeFileSync(join(dir, "update-cache.json"), JSON.stringify({ latestVersion: "", settledExtensionSets: [extensionSetKey(["pi-subagents", "pi-background-tasks"])] }));
    expect(unsettledExtensions(["pi-background-tasks", "pi-subagents"])).toEqual([]);
    expect(unsettledExtensions(["pi-subagents"])).toEqual(["pi-subagents"]);
  });
});
