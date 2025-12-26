# wukong-profiler

🔥 High-performance Node/CLI profiler supporting:

- Nested steps (true Flame Graph)
- Chrome Trace export (`--trace trace.json`)
- HOT step detection with CI failure
- Profile diff for performance regression detection

## English | [简体中文](./README.zh-CN.md)

---

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

### Run profiler

```bash
# Simple run
npx wukong-profiler --flame --trace trace.json

# Set HOT threshold
npx wukong-profiler --hot-threshold 0.8 --fail-on-hot

# With baseline profile for regression detection
npx wukong-profiler --diff-base baseline.json --diff-threshold 0.2
```

### Generate HTML report

```bash
# Generate HTML report from profile.json
npx wukong-profiler report ./profile.json

# Generate and open automatically in browser
npx wukong-profiler report ./profile.json --open

# Specify output HTML file
npx wukong-profiler report ./profile.json -o my-report.html
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
| `-v, --version`        | Show version                                            |
| `-h, --help`           | Show help                                               |

---

## Programmatic Usage

```js
import { createProfiler } from 'wukong-profiler'

const profiler = createProfiler({
  enabled: true,
  flame: true,
  traceFile: 'trace.json',
  hotThreshold: 0.8,
  failOnHot: true,
  diffBaseFile: 'baseline.json',
  diffThreshold: 0.2
})

profiler.step('load data', () => {
  // heavy operation
})
profiler.step('process data', () => {
  // another heavy operation
})

profiler.end('Total')
```

---

## API Reference

### `createProfiler(options)`

Returns a profiler instance.

#### Options

| Name            | Default     | Description                 |
| --------------- | ----------- | --------------------------- |
| `enabled`       | `false`     | Enable output & JSON export |
| `verbose`       | `false`     | Verbose logging             |
| `flame`         | `false`     | Flame-style tree output     |
| `slowThreshold` | `500`       | Slow step threshold (ms)    |
| `hotThreshold`  | `0.8`       | HOT step ratio              |
| `traceFile`     | `undefined` | Chrome trace file           |
| `failOnHot`     | `false`     | Fail CI on HOT step         |
| `diffBaseFile`  | `undefined` | Base profile for diff       |
| `diffThreshold` | `0.2`       | Regression threshold        |

---

### `profiler.step(name, fn)`

Measure a synchronous step.

---

### `profiler.measure(name, fn)`

Measure sync or async function.

---

### `profiler.end(label?)`

Finish profiling and output results.

---

## Examples

```bash
node examples/basic.mjs
node examples/flame.mjs
node examples/async.mjs
```

---

## Chrome Trace

```bash
node examples/basic.mjs
chrome://tracing
```

Load the generated trace file.

or

```text
https://ui.perfetto.dev
```

drag to Load the generated trace file.

---

### 📊 Profile Summary (Top HOT Paths)

````js
const summary = profiler.summary({ top: 3 });

summary.top.forEach(step => {
  console.log(step.path, step.ratio);
});

---

## API Usage

```js
import { createProfiler } from 'wukong-profiler'

const profiler = createProfiler({ enabled: true, flame: true })

// Measure a function
await profiler.measure('heavyTask', async () => {
  await doHeavyWork()
})

// Nested steps
await profiler.measure('outer', async () => {
  await profiler.measure('inner1', task1)
  await profiler.measure('inner2', task2)
})

const { total, events, exitCode } = profiler.end('Total')
console.log('Total time:', total, 'ms')
````

- `measure(name, fn)` : measure a function (sync/async)
- `step(name)` : manually log a step
- `end(label)` : end profiling, optionally export Chrome Trace JSON

---

**Features:**

- Nested steps for Flame Graph visualization
- Slow steps (> threshold) marked as HOT 🔥
- Automatic exit code for CI if HOT steps detected
- Chrome Trace export compatible with Chrome's `chrome://tracing`
- Profile diff for performance regression detection

## 🔍 Keywords

<!--
Node.js profiler, JavaScript profiler, Node performance analysis, CLI profiler,
Flame Graph, Flame Chart, Chrome Trace, Chrome tracing, Perfetto,
Performance regression detection, Profile diff, CI performance check,
HOT path detection, Slow function detection,
Async performance profiling, Nested performance steps,
Node.js benchmarking, Build performance monitoring,
Developer tooling, DevOps performance, Continuous Integration profiling
-->
