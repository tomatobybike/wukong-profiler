import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { createProfiler } from '../src/index.mjs'

const outDir = path.resolve('test', 'tmp-output')
const profilePath = path.join(outDir, 'profile.json')
const tracePath = path.join(outDir, 'trace.json')

// cleanup helper
const cleanup = () => {
  try {
    fs.rmSync(outDir, { recursive: true, force: true })
  } catch (e) {
    /* ignore */
  }
}

test('writes profile and trace to specified directory', () => {
  cleanup()

  const profiler = createProfiler({
    enabled: true,
    profileFile: profilePath,
    traceFile: tracePath,
    flame: false
  })

  profiler.step('work', () => {
    // small sync work
    for (let i = 0; i < 1e4; i++) {}
  })

  const profile = profiler.end('Total')

  // files should exist
  assert.ok(fs.existsSync(profilePath), 'profile file should be written')
  assert.ok(fs.existsSync(tracePath), 'trace file should be written')

  // profile content sanity
  const p = JSON.parse(fs.readFileSync(profilePath, 'utf8'))
  assert.ok(typeof p.total === 'number')
  assert.ok(Array.isArray(p.events))

  // trace content sanity
  const t = JSON.parse(fs.readFileSync(tracePath, 'utf8'))
  assert.ok(Array.isArray(t.traceEvents))

  cleanup()
})
