/**
 * @file: measure.test.mjs
 * @description:测试 measure()（同步 + 异步）
 * @author: King Monkey
 * @created: 2025-12-26 00:15
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createProfiler } from "../src/index.mjs";

test("measure sync function", async () => {
  const profiler = createProfiler();

  await profiler.measure("sync", () => {
    for (let i = 0; i < 1e6; i++) { /* empty */ }
  });

  const { events } = profiler.end();
  assert.equal(events[0].name, "sync");
});

test("measure async function", async () => {
  const profiler = createProfiler();

  await profiler.measure("async", async () => {
    await new Promise((r) => {setTimeout(r, 50)});
  });

  const { events } = profiler.end();
  assert.ok(events[0].duration >= 50);
});
