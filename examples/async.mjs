import { createProfiler } from '../src/utils/profiler.mjs'

/* ----------------------------------
   Mock async tasks
----------------------------------- */

const sleep = (ms) => new Promise((r) => {setTimeout(r, ms)})

async function fetchRecords() {
  await sleep(300)
  return [
    { user: 'Alice', hours: 10 },
    { user: 'Bob', hours: 14 },
    { user: 'Alice', hours: 8 }
  ]
}

async function getOvertimeStats(records) {
  await sleep(800)

  return records.reduce((acc, r) => {
    acc[r.user] = (acc[r.user] || 0) + r.hours
    return acc
  }, {})
}

async function exportCsv(stats) {
  await sleep(200)
  return Object.entries(stats)
    .map(([user, hours]) => `${user},${hours}`)
    .join('\n')
}

/* ----------------------------------
   Profiler usage
----------------------------------- */

const profiler = createProfiler({
  enabled: true,
  flame: true,
  slowThreshold: 500,
  hotThreshold: 0.6
})

/* ----------------------------------
   Async flow with RETURN VALUES
----------------------------------- */

const records = await profiler.measure(
  'fetchRecords',
  () => fetchRecords()
)

const stats = await profiler.measure(
  'getOvertimeStats',
  () => getOvertimeStats(records)
)

// ✅ stats 可以自然继续使用，不是回调
const csv = await profiler.measure(
  'exportCsv',
  () => exportCsv(stats)
)

profiler.end('Total')

console.log('\n📄 CSV Output:')
console.log(csv)
