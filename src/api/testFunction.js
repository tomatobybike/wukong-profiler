// testFunction.js
import { measure, createProfiler } from 'wukong-profiler'
import fs from 'fs'

// 创建 Profiler，可全局配置
const profiler = createProfiler({
  enabled: true,
  verbose: true,
  flame: true,
  trace: 'trace.json',
  hotThreshold: 0.8,
  failOnHot: true
})

// 被测试函数
function heavyComputation(n) {
  let sum = 0
  for (let i = 0; i < n * 1e6; i++) sum += i
  return sum
}

function nestedComputation(n) {
  return measure('nestedComputation', () => {
    const a = measure('heavyComputation', () => heavyComputation(n))
    const b = measure('heavyComputation_half', () => heavyComputation(n / 2))
    return a + b
  })
}

// === 测试入口 ===
measure('Test: heavyComputation', () => heavyComputation(5))
measure('Test: nestedComputation', () => nestedComputation(3))

// 完成并输出总耗时
const result = profiler.end('Total Test')

// 输出 Chrome Trace
if (profiler.traceFile) {
  const traceEvents = result.events.map(ev => ({
    name: ev.name,
    ph: 'X',
    ts: Math.round(ev.sinceStart * 1000), // μs
    dur: Math.round(ev.duration * 1000),  // μs
    pid: 1,
    tid: 1
  }))
  fs.writeFileSync(profiler.traceFile, JSON.stringify({ traceEvents }, null, 2))
  console.log(`Chrome Trace 已生成: ${profiler.traceFile}`)
}

// HOT 步骤触发 CI 非零退出码
const anyHot = result.events.some(ev => ev.hot)
if (anyHot && profiler.failOnHot) {
  console.error('🔥 HOT step detected! Exiting with code 1.')
  process.exit(1)
}
