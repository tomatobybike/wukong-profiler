#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createProfiler } from "../src/utils/profiler.js";
import { formatTime } from "../src/utils/format.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取 package.json 的版本号
// 兼容 Windows
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));


const program = new Command();

program
  .name("wukong-profiler")
  .description(
    "🔥 Node/CLI profiler with flame graph, Chrome Trace and HOT detection"
  )
  .version(pkg.version, "-v, --version", "show version")
  .option("--profile", "save profile.json")
  .option("--flame", "flame-like console output")
  .option("--trace <file>", "Chrome Trace export file")
  .option("--hot-threshold <n>", "HOT step threshold", parseFloat, 0.8)
  .option("--fail-on-hot", "exit with non-zero if HOT step detected")
  .option("--diff-base <file>", "baseline profile for regression check")
  .option("--diff-threshold <n>", "regression diff threshold", parseFloat, 0.2)
  .parse(process.argv);

const opts = program.opts();

const profiler = createProfiler({
  enabled: opts.profile || opts.flame || !!opts.trace || !!opts.diffBase,
  flame: opts.flame,
  traceFile: opts.trace,
  hotThreshold: opts.hotThreshold,
  failOnHot: opts.failOnHot,
  diffBaseFile: opts.diffBase,
  diffThreshold: opts.diffThreshold,
});

console.log(chalk.green("🔥 Wukong Profiler CLI started"));
console.log(
  chalk.gray("Use profiler.step(name, fn) in your code or CLI script")
);

// 输出 total 计时信息
process.on("exit", () => {
  const profile = profiler.end("Total");
  console.log(
    chalk.cyan("Profiler finished. Total:"),
    formatTime(profile.total)
  );
});
