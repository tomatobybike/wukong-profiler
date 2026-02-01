import chalk from 'chalk'
import fs from 'fs'

import path from 'path'
import { diffProfiles } from './diff.mjs'
import { formatTime, makeBar } from './format.mjs'
import { exportChromeTrace } from './trace.mjs'

/* ----------------------------------
   Optional sourcemap resolver
----------------------------------- */
let SourceMapConsumer = null
try {
  const sm = await import('source-map')
  SourceMapConsumer = sm.SourceMapConsumer
} catch {
  /* empty */
}

/* ---------------------------------- */

export const createProfiler = ({
  enabled = false,
  verbose = false,
  flame = false,
  slowThreshold = 500,
  hotThreshold = 0.8,
  traceFile,
  profileFile = 'profile.json',
  failOnHot = false,
  diffBaseFile,
  diffThreshold = 0.2,
  captureSource = true
} = {}) => {
  const start = process.hrtime.bigint()
  const stack = []
  const events = []

  const toMs = (a, b) => Number(b - a) / 1e6

  /* ----------------------------------
     Source capture
  ----------------------------------- */
  const captureSourceInfo = async () => {
    const err = new Error()
    const frames = err.stack
      ?.split('\n')
      .slice(2)
      .map((l) => l.trim())
    if (!frames?.length) return null

    // 尝试找到第一个不在 profiler 文件、node internal、或 node_modules 中的堆栈帧（即调用者）
    const thisFileUrl =
      typeof import.meta !== 'undefined' ? import.meta.url : null
    const thisFileNorm = thisFileUrl
      ? thisFileUrl.replace(/^file:\/\//, '')
      : null

    const isInternalFrame = (p) => {
      if (!p) return true
      const np = p.replace(/^file:\/\//, '')
      if (np.startsWith('node:')) return true
      if (np.includes('node:internal')) return true
      if (np.includes('internal/')) return true
      if (np.includes('node_modules')) return true
      if (np.includes('profiler.mjs')) return true
      return false
    }

    let chosen = null
    for (const f of frames) {
      const m =
        f.match(/\((.*):(\d+):(\d+)\)/) || f.match(/at (.*):(\d+):(\d+)/)
      if (m) {
        const rawPath = m[1]
        const norm = rawPath.replace(/^file:\/\//, '')

        // 跳过 Node 内部/包内/自身的帧
        if (!isInternalFrame(norm)) {
          // 首选真实文件系统路径（驱动器或绝对路径）
          chosen = f
          break
        }
      }
    }

    const top = chosen || frames[0]
    const match =
      top.match(/\((.*):(\d+):(\d+)\)/) || top.match(/at (.*):(\d+):(\d+)/)

    if (!match) return { raw: top }

    const [, file, line, column] = match
    const source = { file, line: Number(line), column: Number(column) }

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
      /* empty */
    }

    return source
  }

  /* ----------------------------------
     Type + Explain
  ----------------------------------- */
  const detectType = (node) => {
    if (node.async) return 'IO'
    if (node.children.length > 0) return 'CPU'
    if (node.duration >= slowThreshold) return 'CPU'
    return 'CPU'
  }

  const explainNode = (node, total) => {
    const ratio = node.duration / total
    const messages = []

    if (ratio >= hotThreshold && node.type === 'CPU') {
      messages.push('Likely CPU-bound (loops or heavy computation)')
    }

    if (ratio >= hotThreshold && node.type === 'IO') {
      messages.push('Likely I/O-bound (serial await or blocking I/O)')
    }

    if (node.duration >= slowThreshold && node.type === 'IO') {
      messages.push('Single I/O operation is slow')
    }

    if (node.depth >= 5) {
      messages.push('Deep call stack — consider flattening logic')
    }

    return messages
  }

  /* ----------------------------------
     CORE STEP (sync + async transparent)
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
      source: null,
      async: false,
      type: null,
      explain: []
    }

    if (parent) parent.children.push(node)
    stack.push(node)

    const finish = async () => {
      const endTime = process.hrtime.bigint()
      node.duration = toMs(startTime, endTime)
      node.type = detectType(node)
      events.push(node)
      stack.pop()

      const totalSoFar = toMs(start, endTime)
      const isSlow = node.duration >= slowThreshold
      const isHot = node.duration / totalSoFar >= hotThreshold

      if ((isSlow || isHot) && captureSource) {
        node.source = await captureSourceInfo()
      }
    }

    try {
      const result = fn?.()

      // async function → 自动升级为 async step
      if (result && typeof result.then === 'function') {
        node.async = true
        return result.finally(finish)
      }

      finish()
      return result
    } catch (e) {
      finish()
      throw e
    }
  }

  // v1.0：measure = step（完全统一）
  const measure = step

  /* ----------------------------------
     STEP ASYNC (explicit async version)
  ----------------------------------- */
  const stepAsync = async (name, fn) => {
    const parent = stack[stack.length - 1]
    const startTime = process.hrtime.bigint()

    const node = {
      name,
      start: toMs(start, startTime),
      duration: 0,
      depth: stack.length,
      children: [],
      source: null,
      async: true,
      type: 'IO',
      explain: []
    }

    if (parent) parent.children.push(node)
    stack.push(node)

    try {
      // 核心：返回 fn 的返回值
      return await fn()
    } finally {
      const endTime = process.hrtime.bigint()
      node.duration = toMs(startTime, endTime)
      events.push(node)
      stack.pop()

      const totalSoFar = toMs(start, endTime)
      const isSlow = node.duration >= slowThreshold
      const isHot = node.duration / totalSoFar >= hotThreshold

      if ((isSlow || isHot) && captureSource) {
        node.source = await captureSourceInfo()
      }
    }
  }

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

          e.explain = explainNode(e, total)

          console.log(
            chalk.gray(`${'  '.repeat(e.depth)}├─`),
            chalk.white(e.name.padEnd(22)),
            chalk.yellow(formatTime(e.duration)),
            chalk.gray(makeBar(ratio)),
            chalk.gray(`[${e.type}]`),
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

          if (e.explain.length) {
            e.explain.forEach((msg) => console.log(chalk.gray(`     ↳ ${msg}`)))
          }
        }
      }
    }

    const profile = { total, events }

    if (traceFile) exportChromeTrace(events, traceFile)

    if (diffBaseFile && fs.existsSync(diffBaseFile)) {
      const base = JSON.parse(fs.readFileSync(diffBaseFile, 'utf8'))
      const regressions = diffProfiles(base, profile, diffThreshold)
      if (regressions.length) process.exitCode = 1
    }

    if (enabled && profileFile) {
      // ensure directory exists
      const dir = path.dirname(profileFile)
      if (dir && dir !== '.' && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(profileFile, JSON.stringify(profile, null, 2))
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
  const summary = ({ top = 5 } = {}) => {
    const total = toMs(start, process.hrtime.bigint())
    return {
      total,
      top: events
        .map((e) => ({
          ...e,
          ratio: e.duration / total
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, top)
    }
  }

  return { step, stepAsync, measure, end, summary }
}
