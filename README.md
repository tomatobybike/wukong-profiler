# wukong-profiler

🔥 High-performance Node/CLI profiler supporting:

- Nested steps (true Flame Graph)
- Chrome Trace export (`--trace trace.json`)
- HOT step detection with CI failure
- Profile diff for performance regression detection

## Installation

```bash
npm install wukong-profiler
```

Or use directly via npx:

```bash
npx wukong-profiler [options]
```

---

## CLI Usage

```bash
npx wukong-profiler --flame --trace trace.json --hot-threshold 0.8 --fail-on-hot
```

**Options:**

| Option                 | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `--profile`            | Save profile JSON for analysis                          |
| `--flame`              | Display flame-like console output                       |
| `--trace <file>`       | Export Chrome Trace JSON file                           |
| `--hot-threshold <n>`  | HOT step threshold (default: 0.8)                       |
| `--fail-on-hot`        | Exit with non-zero code if a HOT step exceeds threshold |
| `--diff-base <file>`   | Compare current profile with baseline for regression    |
| `--diff-threshold <n>` | Diff threshold for regression (default: 0.2)            |

---

## Programmatic Usage

```js
import { createProfiler } from "wukong-profiler";

const profiler = createProfiler({
  enabled: true,
  flame: true,
  traceFile: "trace.json",
  hotThreshold: 0.8,
  failOnHot: true,
  diffBaseFile: "baseline.json",
  diffThreshold: 0.2,
});

profiler.step("load data", () => {
  // heavy operation
});
profiler.step("process data", () => {
  // another heavy operation
});

profiler.end("Total");
```

## API Usage

```js
import { createProfiler } from "wukong-profiler";

const profiler = createProfiler({ enabled: true, flame: true });

// Measure a function
await profiler.measure("heavyTask", async () => {
  await doHeavyWork();
});

// Nested steps
await profiler.measure("outer", async () => {
  await profiler.measure("inner1", task1);
  await profiler.measure("inner2", task2);
});

const { total, events, exitCode } = profiler.end("Total");
console.log("Total time:", total, "ms");
```

- `measure(name, fn)` : measure a function (sync/async)
- `step(name)` : manually log a step
- `end(label)` : end profiling, optionally export Chrome Trace JSON

**Features:**

- Nested steps for Flame Graph visualization
- Slow steps (> threshold) marked as HOT 🔥
- Automatic exit code for CI if HOT steps detected
- Chrome Trace export compatible with Chrome's `chrome://tracing`
- Profile diff for performance regression detection
