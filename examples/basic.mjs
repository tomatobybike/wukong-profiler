import { createProfiler } from "../src/index.mjs";

const profiler = createProfiler({
  flame: true,
  enabled: true,
  traceFile: 'trace.json',
});

await profiler.measure("load data", async () => {
  await new Promise((r) => {setTimeout(r, 120)});
});

profiler.step("sync work", () => {
  for (let i = 0; i < 1e6; i++) {
    Math.sqrt(i);
  }
});

profiler.end();
