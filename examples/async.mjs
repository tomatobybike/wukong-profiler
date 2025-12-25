import { createProfiler } from "../src/index.mjs";

const profiler = createProfiler({ enabled: true });

await profiler.measure("fetch data", async () => {
  await new Promise((r) => {setTimeout(r, 300)});
});

await profiler.measure("process data", async () => {
  await new Promise((r) => {setTimeout(r, 180)});
});

profiler.end("Async Example");
