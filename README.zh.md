# wukong-profiler

🔥 高性能 Node/CLI Profiler，支持：

- 嵌套步骤（真正 Flame Graph）
- Chrome Trace 导出（`--trace trace.json`）
- HOT 步骤检测，可在 CI 失败
- 性能回归检测（profile diff）

## 安装

```bash
npm install wukong-profiler
```

或直接通过 `npx` 使用：

```bash
npx wukong-profiler [options]
```

--

## CLI 使用示例

```bash
npx wukong-profiler --flame --trace trace.json --hot-threshold 0.8 --fail-on-hot
```

**选项说明：**

| 选项                   | 描述                                        |
| ---------------------- | ------------------------------------------- |
| `--profile`            | 保存 profile JSON 供分析使用                |
| `--flame`              | 控制台显示 Flame Graph 风格日志             |
| `--trace <file>`       | 导出 Chrome Trace JSON 文件                 |
| `--hot-threshold <n>`  | HOT 步骤阈值（默认 0.8）                    |
| `--fail-on-hot`        | HOT 步骤超过阈值时退出非零状态码（CI 卡点） |
| `--diff-base <file>`   | 与基线 profile 比较，检测性能回归           |
| `--diff-threshold <n>` | 回归差异阈值（默认 0.2）                    |

---

## 编程使用示例

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
  // 重操作
});
profiler.step("process data", () => {
  // 另一重操作
});

profiler.end("Total");
```

## API 使用

```js
import { createProfiler } from "wukong-profiler";

const profiler = createProfiler({ enabled: true, flame: true });

// 测试单个函数
await profiler.measure("heavyTask", async () => {
  await doHeavyWork();
});

// 嵌套步骤
await profiler.measure("outer", async () => {
  await profiler.measure("inner1", task1);
  await profiler.measure("inner2", task2);
});

const { total, events, exitCode } = profiler.end("Total");
console.log("总耗时:", total, "ms");
```

- `measure(name, fn)` : 测量函数耗时（同步或异步）
- `step(name)` : 手动记录步骤
- `end(label)` : 结束 profiling，可生成 Chrome Trace JSON
-

**功能亮点：**

- 支持嵌套步骤，生成 Flame Graph
- 慢步骤 (> 阈值) 自动标注 🔥 HOT
- HOT 步骤可触发非零退出码，适合 CI 卡点
- 自动生成 Chrome Trace，可在 `chrome://tracing` 查看
- profile diff 检测性能回归
