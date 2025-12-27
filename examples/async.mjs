import { createProfiler } from "../src/index.mjs";

const profiler = createProfiler({ enabled: true });

await profiler.measure("fetch data", async () => {
  await new Promise((r) => {setTimeout(r, 300)});
});

await profiler.measure("process data", async () => {
  await new Promise((r) => {setTimeout(r, 180)});
});

const summary = profiler.summary({ top: 3 })

summary.top.forEach(step => {
  console.log(step.name, step.ratio,step.duration)
})

profiler.end("Async Example");
