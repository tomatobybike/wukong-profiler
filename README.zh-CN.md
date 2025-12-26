# wukong-profiler

🔥 **高性能 Node / CLI 性能分析器（Profiler）**，支持：

- ✅ **真正的嵌套步骤**（真实 Flame Graph 结构）

- ✅ **Chrome Trace 导出**（`--trace trace.json`）

- ✅ **HOT 步骤检测**（支持 CI 直接失败）

- ✅ **Profile Diff**（用于性能回退 / 回归检测）

## 中文 | [English](./README.md)

---

## 安装

```bash
npm install wukong-profiler
```

或直接使用 `npx`：

```bash
npx wukong-profiler [options]
```

---

## CLI 使用方式

```bash
npx wukong-profiler --flame --trace trace.json --hot-threshold 0.8 --fail-on-hot
```

### 运行 Profiler

```bash
# 简单运行
npx wukong-profiler --flame --trace trace.json

# 设置 HOT 阈值
npx wukong-profiler --hot-threshold 0.8 --fail-on-hot

# 使用基准 profile 检测性能回归
npx wukong-profiler --diff-base baseline.json --diff-threshold 0.2
```

### 生成 HTML 报告

````bash
# 从 profile.json 生成 HTML 报告
npx wukong-profiler report ./profile.json

# 生成并自动在浏览器打开
npx wukong-profiler report ./profile.json --open

# 指定输出 HTML 文件
npx wukong-profiler report ./profile.json -o my-report.html

### CLI 参数说明

| 参数                   | 说明                                          |
| ---------------------- | --------------------------------------------- |
| `--profile`            | 保存 profile JSON 文件，用于后续分析          |
| `--flame`              | 在控制台输出 Flame 风格的树状结果             |
| `--trace <file>`       | 导出 Chrome Trace JSON 文件                   |
| `--hot-threshold <n>`  | HOT 步骤占比阈值（默认：0.8）                 |
| `--fail-on-hot`        | 如果存在 HOT 步骤，进程以非 0 退出（CI 失败） |
| `--diff-base <file>`   | 与基准 profile 对比，检测性能回退             |
| `--diff-threshold <n>` | 性能回退阈值（默认：0.2）                     |
| `-v, --version`        | 显示版本号                                    |
| `-h, --help`           | 显示帮助信息                                  |

---

## 编程方式（Programmatic Usage）

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

profiler.step('加载数据', () => {
  // 重任务
})

profiler.step('处理数据', () => {
  // 另一个重任务
})

profiler.end('总耗时')
````

---

## API 文档

### `createProfiler(options)`

创建并返回一个 profiler 实例。

#### Options 参数说明

| 参数名          | 默认值      | 说明                             |
| --------------- | ----------- | -------------------------------- |
| `enabled`       | `false`     | 是否启用 profiler（输出 & JSON） |
| `verbose`       | `false`     | 输出更详细的日志                 |
| `flame`         | `false`     | 输出 Flame 风格的树结构          |
| `slowThreshold` | `500`       | 慢步骤阈值（毫秒）               |
| `hotThreshold`  | `0.8`       | HOT 步骤占比阈值                 |
| `traceFile`     | `undefined` | Chrome Trace 输出文件            |
| `failOnHot`     | `false`     | 检测到 HOT 步骤时 CI 失败        |
| `diffBaseFile`  | `undefined` | 用于 diff 的基准 profile         |
| `diffThreshold` | `0.2`       | 性能回退阈值                     |

---

### `profiler.step(name, fn)`

测量一个 **同步步骤**。

---

### `profiler.measure(name, fn)`

测量一个 **同步或异步函数**。

---

### `profiler.end(label?)`

结束 profiling，并输出最终结果。

---

## 示例

```bash
node examples/basic.mjs
node examples/flame.mjs
node examples/async.mjs
```

---

## Chrome Trace 使用方式

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

### 📊 性能摘要（Top HOT 路径）

```js
const summary = profiler.summary({ top: 3 })
```

---

## API 使用示例

```js
import { createProfiler } from 'wukong-profiler'

const profiler = createProfiler({ enabled: true, flame: true })

// 测量函数
await profiler.measure('heavyTask', async () => {
  await doHeavyWork()
})

// 嵌套步骤
await profiler.measure('outer', async () => {
  await profiler.measure('inner1', task1)
  await profiler.measure('inner2', task2)
})

const { total, events, exitCode } = profiler.end('Total')
console.log('总耗时:', total, 'ms')
```

### API 说明

- `measure(name, fn)`：测量函数（支持 sync / async）

- `step(name)`：手动记录一个步骤

- `end(label)`：结束 profiling，可导出 Chrome Trace

---

## 核心特性总结

- 🔥 **支持嵌套步骤**，天然适合 Flame Graph

- 🔥 **慢步骤 / HOT 步骤自动标记**

- 🔥 **CI 友好**：性能问题可直接让构建失败

- 🔥 **Chrome Trace 导出**，可视化精确到毫秒

- 🔥 **Profile Diff**，用于性能回退检测

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
