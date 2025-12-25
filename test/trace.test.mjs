/**
 * @file: trace.test.mjs
 * @description: 测试 Chrome Trace 文件生成
 * @author: King Monkey
 * @created: 2025-12-26 00:14
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createProfiler } from "../src/index.mjs";

const TRACE_FILE = "./test.trace.json";

test("export chrome trace", () => {
  const profiler = createProfiler({
    traceFile: TRACE_FILE,
  });

  profiler.step("trace-step", () => {
    for (let i = 0; i < 1e5; i++) { /* empty */ }
  });

  profiler.end();

  assert.ok(fs.existsSync(TRACE_FILE));

  const trace = JSON.parse(fs.readFileSync(TRACE_FILE, "utf8"));
  assert.ok(trace.traceEvents.length > 0);

  fs.unlinkSync(TRACE_FILE);
});
