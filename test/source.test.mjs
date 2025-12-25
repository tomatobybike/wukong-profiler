import test from 'node:test'
import assert from 'node:assert'
import fs from 'fs'

import { createProfiler } from '../src/utils/profiler.mjs'

test('capture source info for slow step', async () => {
  const profiler = createProfiler({
    enabled: false,
    slowThreshold: 10,
    captureSource: true
  })

  await profiler.step('slow-step', async () => {
    await new Promise((r) => {setTimeout(r, 20)})
  })

  const profile = profiler.end()

  const slow = profile.events.find((e) => e.name === 'slow-step')

  assert.ok(slow.source, 'source should exist')
  assert.ok(
    slow.source.file || slow.source.original,
    'source should contain location'
  )
})
