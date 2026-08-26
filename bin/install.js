#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STACKS_DIR = join(ROOT, "stacks");
const SKIP_NAMES = new Set([".gitkeep", ".DS_Store"]);

function parseArgs(argv) {
  const args = { stack: null, dest: process.cwd(), force: false, dryRun: false, help: false };
  const rest = argv.slice(2).filter((a) => a !== "--");

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token === "-h" || token === "--help") args.help = true;
    else if (token === "--force") args.force = true;
    else if (token === "--dry-run") args.dryRun = true;
    else if (token === "--dest") args.dest = resolve(rest[++i] ?? "");
    else if (token.startsWith("--dest=")) args.dest = resolve(token.slice("--dest=".length));
    else if (token.startsWith("-")) {
      throw new Error(`Unknown flag: ${token}`);
    } else if (!args.stack) {
      args.stack = token === "list" ? null : token;
    } else {
      throw new Error(`Unexpected argument: ${token}`);
    }
  }

  return args;
}

function loadStacks() {
  return readdirSync(STACKS_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const path = join(STACKS_DIR, name);
      const stack = JSON.parse(readFileSync(path, "utf8"));
      return { ...stack, id: name.replace(/\.json$/, "") };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function printHelp(stacks) {
  const lines = [
    "Usage: non-negotiables [stack] [--dest dir] [--force] [--dry-run]",
    "",
    "Copy personal config files into the current (or --dest) directory.",
    "Existing files are skipped unless --force is set.",
    "",
    "Stacks:",
  ];

  const width = Math.max(...stacks.map((s) => s.id.length));
  for (const stack of stacks) {
    lines.push(`  ${stack.id.padEnd(width)}  ${stack.description}`);
  }

  lines.push("", "Examples:", "  non-negotiables node-ts", "  non-negotiables agents --dest ~/Projects/app --dry-run");
  console.log(lines.join("\n"));
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function sameContents(left, right) {
  try {
    return readFileSync(left).equals(readFileSync(right));
  } catch {
    return false;
  }
}

function writeFile(destPath, body, { force, dryRun }) {
  const already = exists(destPath);
  const payload = Buffer.from(body);
  if (already && payload.equals(readFileSync(destPath))) return "same";
  if (already && !force) return "skip";
  if (dryRun) return already ? "overwrite" : "create";
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, payload);
  return already ? "overwrite" : "create";
}

function copyOne(fromPath, destPath, { force, dryRun }) {
  const already = exists(destPath);
  if (already && !force) {
    return sameContents(fromPath, destPath) ? "same" : "skip";
  }
  if (already && sameContents(fromPath, destPath)) return "same";
  if (dryRun) return already ? "overwrite" : "create";
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(fromPath, destPath);
  return already ? "overwrite" : "create";
}

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_NAMES.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...listFiles(path));
    else out.push(path);
  }
  return out;
}

function applyStack(stack, dest, flags) {
  const counts = { create: 0, skip: 0, same: 0, overwrite: 0 };

  const bump = (action, rel) => {
    counts[action] += 1;
    const label = { create: "create", skip: "skip  ", same: "same  ", overwrite: "force " }[action];
    console.log(`  ${label} ${rel}`);
  };

  for (const file of stack.files ?? []) {
    const fromPath = join(ROOT, file.from);
    const destPath = join(dest, file.to);
    if (!exists(fromPath)) throw new Error(`Missing source file: ${file.from}`);
    bump(copyOne(fromPath, destPath, flags), file.to);
  }

  for (const dir of stack.directories ?? []) {
    const fromDir = join(ROOT, dir.from);
    if (!exists(fromDir)) continue;
    for (const fromPath of listFiles(fromDir)) {
      const rel = relative(fromDir, fromPath);
      const destPath = join(dest, dir.to, rel);
      bump(copyOne(fromPath, destPath, flags), join(dir.to, rel));
    }
  }

  for (const item of stack.ensure ?? []) {
    const destPath = join(dest, item.to);
    const body = item.json
      ? `${JSON.stringify(item.json, null, 2)}\n`
      : (item.content ?? "");
    bump(writeFile(destPath, body, flags), item.to);
  }

  return counts;
}

function main() {
  const args = parseArgs(process.argv);
  const stacks = loadStacks();

  if (args.help || !args.stack) {
    printHelp(stacks);
    return;
  }

  const stack = stacks.find((s) => s.id === args.stack);
  if (!stack) {
    throw new Error(`Unknown stack "${args.stack}". Run with no args to list stacks.`);
  }

  if (resolve(args.dest) === ROOT) {
    throw new Error("Refusing to install into the non-negotiables repo itself. Pass --dest.");
  }

  console.log(`${args.dryRun ? "Dry run: " : ""}Installing "${stack.id}" into ${args.dest}`);
  const counts = applyStack(stack, args.dest, args);

  const summary = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${k}`)
    .join(", ");
  console.log(summary ? `Done. ${summary}.` : "Done. Nothing to copy.");

  if (stack.devDependencies?.length) {
    console.log(`\nSuggested packages:\n  npm i -D ${stack.devDependencies.join(" ")}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
