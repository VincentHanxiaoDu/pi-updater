/**
 * The recurrence invariant for the update prompt (owner report 2026-08-31:
 * "点了也没用，下次还来，即便已经update了" — the prompt kept returning even
 * after an update had been installed, because acting on the offer recorded
 * nothing and the running version only changes after a restart).
 *
 * The rule: an offer for version X is prompted at most once per process, and
 * NEVER again once the user has acted on X (updated or dismissed) — until a
 * NEWER version than X appears or the running version reaches it.
 */

import { describe, expect, it } from "vitest";
import { shouldPromptForVersion } from "../index.js";

const RUNNING = "0.84.2";

function decision(latest: string, cache: { dismissedVersion?: string; actedVersion?: string } | undefined, prompted: string[] = []): boolean {
  return shouldPromptForVersion({ latest, runningVersion: RUNNING, cache, prompted: new Set(prompted) });
}

describe("update prompt recurrence", () => {
  it("prompts for a newer version with no history", () => {
    expect(decision("0.84.4", undefined)).toBe(true);
  });

  it("never prompts for a version the running process already has", () => {
    expect(decision("0.84.2", undefined)).toBe(false);
    expect(decision("0.84.1", undefined)).toBe(false);
  });

  it("does not re-prompt a version already prompted in this process", () => {
    expect(decision("0.84.4", undefined, ["0.84.4"])).toBe(false);
  });

  it("does not re-prompt a version the user dismissed", () => {
    expect(decision("0.84.4", { dismissedVersion: "0.84.4" })).toBe(false);
  });

  it("does not re-prompt a version the user already ACTED on (updated) — the reported defect", () => {
    // The owner updated (disk got the new version) while the long-lived host
    // kept running the old one; the prompt must not return for the same
    // version in fresh sessions.
    expect(decision("0.84.4", { actedVersion: "0.84.4" })).toBe(false);
  });

  it("prompts again when a NEWER version than the acted-on one appears", () => {
    expect(decision("0.84.5", { actedVersion: "0.84.4" })).toBe(true);
  });

  it("acting on one version does not suppress a different version", () => {
    expect(decision("0.84.4", { actedVersion: "0.84.3" })).toBe(true);
  });
});
