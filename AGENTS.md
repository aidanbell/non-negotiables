# AGENTS.md

Instructions for agents working in **this** repo (the config cabinet), not the template copied into other projects. The project-facing template lives at `configs/agents/AGENTS.md`.

## Purpose

This repository is a file cabinet of personal non-negotiables: Prettier, ESLint, TypeScript, EditorConfig, Cursor rules, and agent instructions. Projects pull files in via `npx` / the install script. They do not clone this repo into an app.

## Rules

- Keep primitives in `configs/` and bundles in `stacks/`. Do not mix them.
- Starter configs in `configs/` are meant to be replaced with collected rules. Prefer updating those files over inventing a parallel set.
- `tsconfig.base.json` holds strictness only. Module resolution belongs in `tsconfig.node.json` or `tsconfig.bundler.json`. DOM libs belong in `tsconfig.dom.json`. Path aliases, runtime `types`, and `jsxImportSource` stay out of shared configs.
- The installer must never overwrite existing files unless `--force` is passed.
- Skip adding template engines, publish pipelines, or extra packages unless the user asks.
- When adding a new config, also add or update a stack that installs it, and mention it in the README.
