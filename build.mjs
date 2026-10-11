// Build: esbuild, two targets.
//
//   node build.mjs          → dist/index.js      (the server, bin entry)
//   node build.mjs --tests  → dist-test/*.js     (tests + the live smoke)
//
// Runtime dependencies stay external: the point of this package is that it is
// small and auditable, and a bundled copy of the MCP SDK is neither.

import { build } from 'esbuild'
import { chmodSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const tests = process.argv.includes('--tests')

const common = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  sourcemap: false,
  logLevel: 'info',
}

if (tests) {
  const entries = readdirSync('test')
    .filter((f) => f.endsWith('.test.ts') || f === 'smoke.ts')
    .map((f) => join('test', f))
  await build({
    ...common,
    entryPoints: entries,
    outdir: 'dist-test',
    packages: 'external',
  })
} else {
  await build({
    ...common,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    packages: 'external',
    banner: { js: '#!/usr/bin/env node' },
  })
  // `bin` is run directly by MCP clients, so the shebang needs the bit to match.
  chmodSync('dist/index.js', 0o755)
}
