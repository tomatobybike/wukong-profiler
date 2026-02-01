#!/usr/bin/env node
import readline from 'node:readline'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))

const examples = [
  { name: 'Async', file: 'async.mjs' },
  { name: 'Basic', file: 'basic.mjs' },
  { name: 'Flame', file: 'flame.mjs' }
]

console.log(chalk.green.bold('Select an example to run:'))
examples.forEach((ex, i) => {
  console.log(chalk.blue(`${i + 1}. ${ex.name}`))
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question(chalk.yellow('Enter number: '), async (answer) => {
  rl.close()

  const idx = parseInt(answer.trim(), 10) - 1

  if (idx < 0 || idx >= examples.length) {
    console.log(chalk.red('Invalid choice'))
    process.exit(1)
  }

  const filePath = join(__dirname, examples[idx].file)
  const fileURL = pathToFileURL(filePath).href

  console.log(chalk.green(`\nRunning example: ${examples[idx].name}\n`))

  try {
    // 动态导入 ESM 文件，支持 Windows / Linux / macOS
    await import(fileURL)
  } catch (err) {
    console.error(chalk.red('Error running example:'), err)
  }
})
