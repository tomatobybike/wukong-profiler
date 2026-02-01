# wukong-profiler

<p align="center"> <a href="https://www.npmjs.com/package/wukong-profiler"> <img src="https://img.shields.io/npm/v/wukong-profiler.svg" alt="npm version"> </a> <a href="https://www.npmjs.com/package/wukong-profiler"> <img src="https://img.shields.io/npm/dm/wukong-profiler.svg" alt="downloads"> </a> <a href="https://github.com/tomatobybike/wukong-profiler/blob/master/LICENSE"> <img src="https://img.shields.io/github/license/tomatobybike/wukong-profiler.svg" alt="license"> </a> <a href="https://github.com/tomatobybike/wukong-profiler"> <img src="https://img.shields.io/github/stars/tomatobybike/wukong-profiler.svg?style=social" alt="GitHub stars"> </a> <a href="https://github.com/tomatobybike/wukong-profiler/issues"> <img src="https://img.shields.io/github/issues/tomatobybike/wukong-profiler.svg" alt="issues"> </a> </p>

🔥 **High-performance Node.js / CLI wall-time profiler**, designed for **real async / await workloads**.

**Key capabilities:**

- ✅ Accurate async / await wall-time profiling

- ✅ Nested steps (true hierarchical Flame Tree)

- ✅ Automatic HOT / SLOW step detection

- ✅ CPU vs I/O heuristic classification

- ✅ Actionable performance explanations

- ✅ Chrome Trace export (Chrome / Perfetto)

- ✅ Profile diff for regression detection (CI-friendly)

## English | [简体中文](./README.zh-CN.md)

---

## 📦 Installation

```bash
npm install wukong-profiler
```

```bash
yarn add wukong-profiler
```

Or use directly via npx:

```bash
npx wukong-profiler [options]
```

---

## 🧑‍💻 CLI Usage

```bash
npx wukong-profiler report ./profile.json
```

### CLI

```bash
# Generate HTML report from a profile.json
npx wukong-profiler report ./profile.json
```

To profile code, use the programmatic API (`createProfiler`) or the examples in the `examples/` folder.

## 🧠 Output Example

```text
⏱ Total 28.52 s
├─ getGitLogsFast        957.78 ms  ⚠ SLOW [IO]
│   ↳ Likely I/O-bound (serial await or blocking I/O)
├─ getOvertimeStats      26.39 s    🔥 HOT  [CPU]
│   ↳ Likely CPU-bound (loops or heavy computation)
│   ↳ Deep call stack — consider flattening logic
```

###

### Generate HTML report

```bash
# Generate HTML report from profile.json
npx wukong-profiler report ./profile.json

# Generate and open automatically in browser
npx wukong-profiler report ./profile.json --open

# Specify output HTML file
npx wukong-profiler report ./profile.json -o my-report.html
```

Usage: `npx wukong-profiler report <profile>`

`<profile>` is the path to a `profile.json` file (required).

**Report subcommand options:**

| Option                | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `--profile`           | Saved profile JSON for analysis                         |
| `-o, --output <file>` | Output HTML file (default: "wukong-report.html")        |
| `--open`              | Open the report in the default browser after generation |

> Note: This CLI only exposes the `report` subcommand. To profile code, use the JavaScript API (`createProfiler`) or the `examples/` folder. For report-specific help run `npx wukong-profiler report -h`.

---

## 📘 Programmatic Usage

```js
import { createProfiler } from 'wukong-profiler'

const profiler = createProfiler({
  enabled: true,
  flame: true,
  traceFile: 'trace.json',
  profileFile: 'artifacts/profile.json', // write profile to a custom directory
  hotThreshold: 0.8,
  failOnHot: true,
  diffBaseFile: 'baseline.json',
  diffThreshold: 0.2
})

// Example: write outputs to an `artifacts/` folder for CI
// const profiler = createProfiler({ enabled: true, profileFile: 'artifacts/profile.json', traceFile: 'artifacts/trace.json' })

profiler.step('load config', () => {
  // sync work
})

await profiler.stepAsync('fetch data', async () => {
  await fetchRemoteData()
})

profiler.end('Total')
```

---

## Async / Await Profiling (Recommended)

`wukong-profiler` **explicitly supports async profiling** via `stepAsync`.

This guarantees correct **wall-time measurement**, even when the event loop is idle.

```js
await profiler.stepAsync('getGitLogsFast', async () => {
  await readGitLogs()
})

await profiler.stepAsync('getOvertimeStats', async () => {
  await calculateStats()
})
```

Why `stepAsync`?

- ✔ Measures full async duration (not just sync part)

- ✔ Maintains correct nesting structure

- ✔ Enables accurate I/O vs CPU classification

---

## 🧩 API Reference

### `createProfiler(options)`

Returns a profiler instance.

#### Options

| Name            | Default     | Description                 |
| --------------- | ----------- | --------------------------- | --- | ------------- | -------------- | ------------------------------- | --- | ----------- | ------- | ------------------- |
| `enabled`       | `false`     | Enable output & JSON export |
| `verbose`       | `false`     | Verbose logging             |
| `flame`         | `false`     | Flame-style tree output     |
| `slowThreshold` | `500`       | Slow step threshold (ms)    |
| `hotThreshold`  | `0.8`       | HOT step ratio              |
| `traceFile`     | `undefined` | Chrome trace file           |     | `profileFile` | `profile.json` | Path to write profile JSON file |     | `failOnHot` | `false` | Fail CI on HOT step |
| `diffBaseFile`  | `undefined` | Base profile for diff       |
| `diffThreshold` | `0.2`       | Regression threshold        |

---

### `profiler.step(name, fn)`

Measure a synchronous step.

```js
profiler.step('parse config', () => {
  parseConfig()
})
```

### `profiler.stepAsync(name, asyncFn)`

Measure an **async step** with full wall-time accuracy.

```js
await profiler.stepAsync('fetch users', async () => {
  await fetchUsers()
})
```

---

### `profiler.measure(name, fn)`

Alias of `step` (sync).
For async workloads, **prefer `stepAsync`** for clarity.

---

### `profiler.end(label?)`

Finish profiling and output results.

```js
profiler.end('Total')
```

---

### `profiler.summary(options?)`

Get structured summary data for reporting or CI.

```js
const summary = profiler.summary({ top: 3 })

summary.top.forEach((step) => {
  console.log(step.name, step.ratio)
})
```

---

### 📊 Profile Summary (Top HOT Paths)

```js
const summary = profiler.summary({ top: 3 })

summary.top.forEach((step) => {
  console.log(step.path, step.ratio)
})
```

---

## Examples

```bash
node examples/basic.mjs
node examples/flame.mjs
node examples/async.mjs
```

---

## 🧪 Chrome Trace

```bash
node examples/basic.mjs
```

Open:

```bash
chrome://tracing
```

Load the generated trace file.

or

```text
https://ui.perfetto.dev
```

drag to Load the generated trace file.

<!--
Node.js profiler, JavaScript profiler, Node performance analysis, CLI profiler,
Flame Graph, Flame Chart, Chrome Trace, Chrome tracing, Perfetto,
Performance regression detection, Profile diff, CI performance check,
HOT path detection, Slow function detection,
Async performance profiling, Nested performance steps,
Node.js benchmarking, Build performance monitoring,
Developer tooling, DevOps performance, Continuous Integration profiling
-->
