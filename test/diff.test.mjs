/**
 * @file: diff.test.mjs
 * @description:测试性能回归 diff
 * @author: King Monkey
 * @created: 2025-12-26 00:16
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createProfiler } from "../src/index.mjs";

const BASE = "./base.profile.json";

test.beforeEach(() => {
  process.exitCode = undefined;
});

test.afterEach(() => {
  process.exitCode = undefined;
  if (fs.existsSync(BASE)) fs.unlinkSync(BASE);
});

test("detect performance regression", () => {
  // baseline
  const baseProfiler = createProfiler();
  baseProfiler.step("job", () => {
    for (let i = 0; i < 1e5; i++) { /* empty */ }
  });
  const base = baseProfiler.end();
  fs.writeFileSync(BASE, JSON.stringify(base));

  // slower version
  const profiler = createProfiler({
    diffBaseFile: BASE,
    diffThreshold: 0.1,
  });

  profiler.step("job", () => {
    for (let i = 0; i < 2e6; i++) { /* empty */ }
  });

  profiler.end();

  assert.equal(process.exitCode, 1);
});

