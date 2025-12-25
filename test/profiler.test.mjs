/**
 * @file: profiler.test.mjs
 * @description:测试基本 step / end 行为
 * @author: King Monkey
 * @created: 2025-12-26 00:15
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createProfiler } from "../src/index.mjs";

test("profiler records steps and total time", () => {
  const profiler = createProfiler({ enabled: false });

  profiler.step("step-1", () => {
    for (let i = 0; i < 1e5; i++) { /* empty */ }
  });

  const profile = profiler.end();

  assert.ok(profile.total > 0);
  assert.equal(profile.events.length, 1);
  assert.equal(profile.events[0].name, "step-1");
  assert.ok(profile.events[0].duration > 0);
});
