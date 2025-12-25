import { createProfiler } from '../src/index.mjs'
import { formatTime } from '../src/utils/format.mjs'

const profiler = createProfiler({
  flame: true,
  enabled: true,
  traceFile: 'trace.json'
})

await profiler.measure('load data', async () => {
  await new Promise((r) => {
    setTimeout(r, 120)
  })
})

profiler.step('sync work', () => {
  for (let i = 0; i < 1e6; i++) {
    Math.sqrt(i)
  }
})

const summary = profiler.summary({ top: 5 })
console.log('\n📊 Top HOT Paths:\n')
summary.top.forEach((s, i) => {
  console.log(
    `${i + 1}. ${s.path}`,
    formatTime(s.duration),
    s.hot ? `🔥 HOT` : ''
  )
  if(s.hot) {
    console.log(`${JSON.stringify(s.source,null,2)}\n`)
  }
})

profiler.end()
