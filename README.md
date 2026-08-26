# non-negotiables

Getting tired of dropping the same configs into every projects, I've decided to build them into this repo.
Here you'll find my configs for Prettier, ESLint, Typescript, Editor, Cursor, as well as my go-to AGENTS.md
because, well...

![non-negotiables](./assets/nonnegotiables.jpg)

This repo is a file cabinet, not an app template. Copy files in. Do not clone it into a real project.

## Pull files into a project

From the project root:

```bash
npx --yes github:YOUR_GITHUB_USER/non-negotiables node-ts
```

Locally, while developing this repo:

```bash
node /path/to/non-negotiables/bin/install.js node-ts
```

Useful flags:

```bash
node bin/install.js            # list stacks
node bin/install.js node-ts --dry-run
node bin/install.js node-ts --force
node bin/install.js agents --dest /path/to/project
```

Existing files are left alone unless you pass `--force`.

## Layout

```text
configs/          primitives — edit these as you collect rules
  agents/         AGENTS.md copied into other projects
  prettier/
  eslint/
  typescript/     base (strictness) + node / bundler / dom profiles
  editor/
  cursor/rules/   drop .mdc files here
stacks/           named bundles the installer copies
bin/install.js    one-command copy
```

TypeScript is split on purpose:

- `tsconfig.base.json` — strictness (the actual non-negotiables)
- `tsconfig.node.json` — NodeNext, emit declarations
- `tsconfig.bundler.json` — bundler resolution, `noEmit` (APIs, workers, JSX runtimes)
- `tsconfig.dom.json` — bundler + `DOM` libs (SPAs, browser apps)
- the project's own `tsconfig.json` — `include`, `paths`, and runtime `types` only, created if missing

Path aliases (`@/*`), `types` (`vite/client`, `bun`, …), and `jsxImportSource` stay in the project file. They are not non-negotiables.

## Stacks

| Stack     | What it copies                                                     |
| --------- | ------------------------------------------------------------------ |
| `node-ts` | Prettier, ESLint, TS (node), EditorConfig, AGENTS.md, Cursor rules |
| `bundler` | Same as `node-ts` but TS bundler profile (no DOM)                  |
| `browser` | Same as `bundler` but `tsconfig.json` extends the DOM profile      |
| `agents`  | `AGENTS.md` only                                                   |
| `editor`  | `.editorconfig` only                                               |

## Collecting rules

Replace the starter files in `configs/` with whatever you pull from existing projects. Then bump the relevant stack if you add a new file.

Cursor rules: put `.mdc` files in `configs/cursor/rules/`. The `node-ts` and `bundler` stacks copy them to `.cursor/rules/`.

## Optional: extend instead of copy

If you later install this repo as a git dependency, projects can extend instead of copying:

```json
{
  "prettier": "non-negotiables/prettier"
}
```

```json
{
  "extends": "non-negotiables/tsconfig/base"
}
```

`AGENTS.md` and Cursor rules still have to be copied — they must live in the project.

## Suggested packages (`node-ts` / `bundler` / `browser`)

The installer only copies files. In the consuming project:

```bash
npm i -D prettier eslint typescript typescript-eslint @eslint/js
```
