import fs from 'fs'

export const exportChromeTrace = (events, file) => {
  const traceEvents = []

  for (const e of events) {
    traceEvents.push({
      name: e.name,
      cat: 'cli',
      ph: 'X',
      ts: e.start * 1000,
      dur: e.duration * 1000,
      pid: 1,
      tid: e.depth || 0
    })
  }

  const trace = {
    traceEvents,
    displayTimeUnit: 'ms'
  }

  fs.writeFileSync(file, JSON.stringify(trace, null, 2))
}
