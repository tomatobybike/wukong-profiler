#!/usr/bin/env zx

await $`yarn test`
await $`node bin/wukong-profiler --version`
await $`node bin/wukong-profiler --help`
await $`node bin/wukong-profiler report ./profile.json`.nothrow()
