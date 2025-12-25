import { createProfiler } from "../src/index.mjs";

const profiler = createProfiler({
  enabled: true,
  flame: true,
  hotThreshold: 0.5,
  failOnHot: false,
});

profiler.step("fast step", () => {
  for (let i = 0; i < 1e5; i++) {
    Math.sqrt(i);
  }
});

profiler.step("slow step", () => {
  for (let i = 0; i < 5e6; i++) {
    Math.sqrt(i);
  }
});

profiler.end("Flame Demo");
