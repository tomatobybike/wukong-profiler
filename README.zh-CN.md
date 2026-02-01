# wukong-profiler

<p align="center"> <a href="https://www.npmjs.com/package/wukong-profiler"> <img src="https://img.shields.io/npm/v/wukong-profiler.svg" alt="npm version"> </a> <a href="https://www.npmjs.com/package/wukong-profiler"> <img src="https://img.shields.io/npm/dm/wukong-profiler.svg" alt="downloads"> </a> <a href="https://github.com/tomatobybike/wukong-profiler/blob/master/LICENSE"> <img src="https://img.shields.io/github/license/tomatobybike/wukong-profiler.svg" alt="license"> </a> <a href="https://github.com/tomatobybike/wukong-profiler"> <img src="https://img.shields.io/github/stars/tomatobybike/wukong-profiler.svg?style=social" alt="GitHub stars"> </a> <a href="https://github.com/tomatobybike/wukong-profiler/issues"> <img src="https://img.shields.io/github/issues/tomatobybike/wukong-profiler.svg" alt="issues"> </a> </p>

🔥 **面向真实 async / await 场景的 Node.js / CLI 性能分析工具**

`wukong-profiler` 是一个**轻量、准确、可用于 CI 的 wall-time profiler**，专注解决一个核心问题：

> **在真实的异步 Node.js 程序中，时间到底花在哪里？**

---

## ✨ 核心特性

- ✅ **原生支持 async / await**（真实 wall-time）

- ✅ **层级嵌套步骤**（Flame Tree 结构，而非平铺日志）

- ✅ **HOT / SLOW 自动标记**

- ✅ **CPU / I/O 自动分类（heuristic）**

- ✅ **自动给出性能解释建议**

- ✅ **Chrome Trace 导出（Chrome / Perfetto）**

- ✅ **性能回归 diff（CI 友好）**

- ✅ \*\*零侵入、零魔法、可预测

## 中文 | [English](./README.md)

---

## 📦 安装

```bash
npm install wukong-profiler
```

```bash
yarn add wukong-profiler
```

或直接使用 `npx`：

```bash
npx wukong-profiler [options]
```

---

## 🧑‍💻 CLI 使用方式

```bash
npx wukong-profiler report ./profile.json
```

### CLI

```bash
# 从 profile.json 生成 HTML 报告
npx wukong-profiler report ./profile.json
```

要进行 profile，请使用编程 API（`createProfiler`）或查看 `examples/` 目录中的示例。

## 🧠 输出示例（重点）

```text
⏱ Total 28.52 s
├─ getGitLogsFast        957.78 ms  ⚠ SLOW [IO]
│   ↳ Likely I/O-bound (serial await or blocking I/O)
├─ getOvertimeStats      26.39 s    🔥 HOT  [CPU]
│   ↳ Likely CPU-bound (loops or heavy computation)
│   ↳ Deep call stack — consider flattening logic
```

### 你能一眼看懂什么？

- **谁是 HOT 路径**

- **是 CPU 还是 I/O 问题**

- **是不是 await 串行**

- **是不是调用层级过深**

### 生成 HTML 报告

```bash
# 从 profile.json 生成 HTML 报告
npx wukong-profiler report ./profile.json

# 生成并自动在浏览器打开
npx wukong-profiler report ./profile.json --open

# 指定输出 HTML 文件
npx wukong-profiler report ./profile.json -o my-report.html

```

用法：`npx wukong-profiler report <profile>`

`<profile>` 是要生成报告的 `profile.json` 文件路径（必填）。

### Report 子命令选项

| 参数                  | 说明                                         |
| --------------------- | -------------------------------------------- |
| `-o, --output <file>` | 输出 HTML 文件（默认："wukong-report.html"） |
| `--profile`           | 保存的 profile JSON 文件，用于分析           |
| `--open`              | 生成后在默认浏览器中打开报告                 |

> 注意：CLI 目前仅暴露 `report` 子命令。要运行 profiling，请使用编程 API（`createProfiler`）或查看 `examples/` 目录。查看 `report` 子命令帮助：`npx wukong-profiler report -h`。

---

---

## 📘 编程方式使用（推荐）

### 基础示例

```bash
import { createProfiler } from 'wukong-profiler'

const profiler = createProfiler({
  enabled: true,
  flame: true,
  profileFile: 'artifacts/profile.json', // 将 profile 输出到指定目录
  traceFile: 'artifacts/trace.json',
  hotThreshold: 0.8
})

// 示例：在 CI 中将输出写入 artifacts/ 目录
// const profiler = createProfiler({ enabled: true, profileFile: 'artifacts/profile.json', traceFile: 'artifacts/trace.json' })

profiler.step('load config', () => {
  loadConfig()
})

await profiler.stepAsync('fetch data', async () => {
  await fetchRemoteData()
})

profiler.end('Total')
```

## ⚠️ Async / Await 性能分析（强烈推荐）

### 为什么要用 `stepAsync`？

在 Node.js 中：

- `await` 会释放事件循环

- 同步 profiler **无法正确统计 wall-time**

- `wukong-profiler` 明确区分 sync / async

### 正确姿势

```js
await profiler.stepAsync('getGitLogsFast', async () => {
  await readGitLogs()
})

await profiler.stepAsync('getOvertimeStats', async () => {
  await calculateStats()
})
```

### 能得到什么？

- ✔ 完整 async wall-time

- ✔ 正确的嵌套结构

- ✔ I/O vs CPU 自动分类

- ✔ 可用于 CI / diff

---

### 🧩 API 说明

### `createProfiler(options)`

创建并返回一个 profiler 实例。

#### Options 参数说明

| 参数名          | 默认值         | 说明                             |
| --------------- | -------------- | -------------------------------- |
| `enabled`       | `false`        | 是否启用 profiler（输出 & JSON） |
| `verbose`       | `false`        | 输出更详细的日志                 |
| `flame`         | `false`        | 输出 Flame 风格的树结构          |
| `slowThreshold` | `500`          | 慢步骤阈值（毫秒）               |
| `hotThreshold`  | `0.8`          | HOT 步骤占比阈值                 |
| `traceFile`     | `undefined`    | Chrome Trace 输出文件            |
| `profileFile`   | `profile.json` | profile JSON 文件 存储路径       |
| `failOnHot`     | `false`        | 检测到 HOT 步骤时 CI 失败        |
| `diffBaseFile`  | `undefined`    | 用于 diff 的基准 profile         |
| `diffThreshold` | `0.2`          | 性能回退阈值                     |

---

### `profiler.step(name, fn)`

测量一个 **同步步骤**。

```bash
profiler.step('parse config', () => {
  parseConfig()
})
```

---

### `profiler.stepAsync(name, asyncFn)`

测量**异步步骤（推荐）**，完整 wall-time。

```js
await profiler.stepAsync('fetch users', async () => {
  await fetchUsers()
})
```

---

### `profiler.measure(name, fn)`

`step` 的别名（仅同步）。

> ⚠️ 对 async 场景，**推荐使用 `stepAsync`**，语义更清晰。

---

### `profiler.end(label?)`

结束 profiling 并输出结果。

```js
profiler.end('Total')
```

---

### `profiler.summary(options?)`

获取结构化数据（适合 CI / 上报）。

```js
const summary = profiler.summary({ top: 3 })

summary.top.forEach((step) => {
  console.log(step.name, step.ratio)
})
```

---

### 📊 性能摘要（Top HOT 路径）

```js
const summary = profiler.summary({ top: 3 })
```

---

## 示例

```bash
node examples/basic.mjs
node examples/flame.mjs
node examples/async.mjs
```

---

## 🧪 Chrome Trace 使用方式

```bash
node examples/basic.mjs
```

然后在浏览器中打开：

```text
chrome://tracing
```

加载生成的 trace 文件。

或使用 Perfetto（推荐）：

```text
https://ui.perfetto.dev
```

将生成的 trace 文件拖入即可查看。

---

<!--
Node.js profiler, JavaScript profiler, Node performance analysis, CLI profiler,
Flame Graph, Flame Chart, Chrome Trace, Chrome tracing, Perfetto,
Performance regression detection, Profile diff, CI performance check,
HOT path detection, Slow function detection,
Async performance profiling, Nested performance steps,
Node.js benchmarking, Build performance monitoring,
Developer tooling, DevOps performance, Continuous Integration profiling
-->
