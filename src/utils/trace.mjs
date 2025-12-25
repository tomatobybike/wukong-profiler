import fs from 'fs'

export const exportChromeTrace = (events, file) => {
  const traceEvents = []
  const pid = 1
  const tid = 1

  const walk = (nodes) => {
    for (const n of nodes) {
      traceEvents.push({
        name: n.name,
        cat: 'wukong',
        ph: 'X', // complete event
        ts: Math.round(n.start * 1000), // ms → μs
        dur: Math.round(n.duration * 1000),
        pid,
        tid,
        args: {
          duration_ms: n.duration,
          depth: n.depth,
          ...(n.source && {
            source: n.source.original
              ? `${n.source.original.source}:${n.source.original.line}`
              : `${n.source.file}:${n.source.line}`
          })
        }
      })

      if (n.children?.length) walk(n.children)
    }
  }

  walk(events)

  fs.writeFileSync(
    file,
    JSON.stringify({ traceEvents }, null, 2),
    'utf8'
  )
}
