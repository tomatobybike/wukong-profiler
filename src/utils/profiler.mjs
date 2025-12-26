import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { diffProfiles } from './diff.mjs'
import { formatTime, makeBar } from './format.mjs'
import { exportChromeTrace } from './trace.mjs'

/* ----------------------------------
   Optional sourcemap resolver
----------------------------------- */
let SourceMapConsumer = null
try {
  // optional dependency
  const sm = await import('source-map')
  SourceMapConsumer = sm.SourceMapConsumer
} catch {
  // ignore – sourcemap is optional
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const createProfiler = ({
  enabled = false,
  verbose = false,
  flame = false,
  slowThreshold = 500,
  hotThreshold = 0.8,
  traceFile,
  failOnHot = false,
  diffBaseFile,
  diffThreshold = 0.2,
  captureSource = true // 🔥 new
} = {}) => {
  const start = process.hrtime.bigint()
  const stack = []
  const events = []

  const toMs = (a, b) => Number(b - a) / 1e6

  /* ----------------------------------
     Stack + sourcemap capture
  ----------------------------------- */
  const captureSourceInfo = async () => {
    const err = new Error()
    const frames = err.stack
      ?.split('\n')
      .slice(2)
      .map((l) => l.trim())

    if (!frames?.length) return null

    const top = frames[0]

    const match =
      top.match(/\((.*):(\d+):(\d+)\)/) ||
      top.match(/at (.*):(\d+):(\d+)/)

    if (!match) return { raw: top }

    const [, file, line, column] = match
    const source = {
      file,
      line: Number(line),
      column: Number(column)
    }

    if (!captureSource || !SourceMapConsumer) return source

    try {
      const mapFile = `${file}.map`
      if (!fs.existsSync(mapFile)) return source

      const rawMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
      const consumer = await new SourceMapConsumer(rawMap)

      const pos = consumer.originalPositionFor({
        line: source.line,
        column: source.column
      })

      consumer.destroy?.()

      if (pos?.source) {
        return {
          ...source,
          original: {
            source: pos.source,
            line: pos.line,
            column: pos.column,
            name: pos.name
          }
        }
      }
    } catch {
      /* silent */
    }

    return source
  }

  /* ----------------------------------
     STEP / MEASURE
  ----------------------------------- */
  const step = (name, fn) => {
    const parent = stack[stack.length - 1]
    const startTime = process.hrtime.bigint()

    const node = {
      name,
      start: toMs(start, startTime),
      duration: 0,
      depth: stack.length,
      children: [],
      source: null
    }

    if (parent) parent.children.push(node)
    stack.push(node)

    const finish = async () => {
      const endTime = process.hrtime.bigint()
      node.duration = toMs(startTime, endTime)
      events.push(node)
      stack.pop()

      const totalSoFar = toMs(start, endTime)
      const isSlow = node.duration >= slowThreshold
      const isHot = totalSoFar > 0 && node.duration / totalSoFar >= hotThreshold

      if ((isSlow || isHot) && captureSource) {
        node.source = await captureSourceInfo()
      }
    }

    try {
      const result = fn?.()
      if (result && typeof result.then === 'function') {
        return result.finally(finish)
      }
      finish()
      return result
    } catch (err) {
      finish()
      throw err
    }
  }

  const measure = (name, fn) => step(name, fn)

  /* ----------------------------------
     END
  ----------------------------------- */
  const end = (label = 'Total') => {
    const total = toMs(start, process.hrtime.bigint())

    let hasHot = false
    for (const e of events) {
      if (e.duration / total >= hotThreshold) {
        hasHot = true
      }
    }

    if (enabled || verbose) {
      console.log(
        chalk.cyan('⏱'),
        chalk.bold(label),
        chalk.yellow(formatTime(total))
      )

      if (flame) {
        for (const e of events) {
          const ratio = e.duration / total
          const hot = ratio >= hotThreshold
          const slow = e.duration >= slowThreshold

          console.log(
            chalk.gray(`${'  '.repeat(e.depth)}├─`),
            chalk.white(e.name.padEnd(22)),
            chalk.yellow(formatTime(e.duration)),
            chalk.gray(makeBar(ratio)),
            hot
              ? chalk.red.bold(' 🔥 HOT')
              : slow
                ? chalk.yellow(' ⚠ SLOW')
                : ''
          )

          if ((hot || slow) && e.source) {
            console.log(
              chalk.gray(
                `     ↳ ${e.source.original?.source || e.source.file}:${
                  e.source.original?.line || e.source.line
                }`
              )
            )
          }
        }
      }
    }

    const profile = { total, events }

    if (traceFile) exportChromeTrace(events, traceFile)

    if (diffBaseFile && fs.existsSync(diffBaseFile)) {
      const base = JSON.parse(fs.readFileSync(diffBaseFile, 'utf8'))
      const regressions = diffProfiles(base, profile, diffThreshold)

      if (regressions.length) {
        if (enabled || verbose) {
          console.log(chalk.red('\n⚠ Performance Regression Detected:\n'))
          regressions.forEach((r) =>
            console.log(
              chalk.red(
                `  ${r.name}: ${formatTime(r.before)} → ${formatTime(
                  r.after
                )} (+${(r.diff * 100).toFixed(1)}%)`
              )
            )
          )
        }
        process.exitCode = 1
      }
    }

    if (enabled) {
      fs.writeFileSync('profile.json', JSON.stringify(profile, null, 2))
    }

    if (failOnHot && hasHot) {
      if (enabled || verbose) {
        console.log(chalk.red('\n🔥 HOT step detected — failing CI'))
      }
      process.exitCode = 1
    }

    return profile
  }

  /* ----------------------------------
     SUMMARY
  ----------------------------------- */
  const flatten = (nodes, parentPath = []) => {
    let res = []
    for (const n of nodes) {
      const pathArr = [...parentPath, n.name]
      res.push({
        name: n.name,
        path: pathArr.join(' → '),
        duration: n.duration,
        depth: n.depth,
        source: n.source
      })
      if (n.children?.length) {
        res = res.concat(flatten(n.children, pathArr))
      }
    }
    return res
  }

  // eslint-disable-next-line no-shadow
  const summary = ({ top = 5, hotThreshold = 0.8 } = {}) => {
    const total = toMs(start, process.hrtime.bigint())

    const flat = flatten(events)
      .map((e) => ({
        ...e,
        ratio: e.duration / total,
        hot: e.duration / total >= hotThreshold
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, top)

    return { total, top: flat }
  }

  return { step, measure, end, summary }
}
