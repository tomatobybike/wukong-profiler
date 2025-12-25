/**
 * @file: hot.test.mjs
 * @description: 测试 HOT 检测 & CI exit code
 * @author: King Monkey
 * @created: 2025-12-26 00:15
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createProfiler } from "../src/index.mjs";

test.beforeEach(() => {
  process.exitCode = undefined;
});

test.afterEach(() => {
  process.exitCode = undefined;
});

test("detect HOT step", () => {
  const profiler = createProfiler({
    flame: true,
    hotThreshold: 0.5,
    failOnHot: true,
  });

  profiler.step("hot-step", () => {
    for (let i = 0; i < 5e6; i++) { /* empty */ }
  });

  profiler.step("cold-step", () => {
    for (let i = 0; i < 1e5; i++) { /* empty */ }
  });

  profiler.end();

  assert.equal(process.exitCode, 1);
});
