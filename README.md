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

## Supported versions

These files target **current majors**. They will not work in a project still on ESLint 8, TypeScript 5.5, or Prettier 2. Upgrade that toolchain, or skip the lint/TS stacks and only copy `agents` / `editor`.

Floors live in `versions.json` (the installer reads the same file):

| Tool | Version | Why that floor |
| --- | --- | --- |
| Node.js | `>=20.19` | ESLint 10; `import.meta.dirname` |
| TypeScript | `>=5.6 <6.1` | `noUncheckedSideEffectImports`; typescript-eslint caps at `<6.1` |
| ESLint | `>=9.22 <11` | `defineConfig` / `globalIgnores` from `eslint/config` (9.22+). Flat config only — no `.eslintrc` |
| `@eslint/js` | same major as ESLint | Core recommended config |
| typescript-eslint | `^8.23` | Flat config + `projectService` typed linting |
| Prettier | `^3` | Current config shape |
| eslint-config-prettier | `^10` | Flat config + `@stylistic` |
| `@stylistic/eslint-plugin` | `^5` | `@stylistic/spaced-comment` |
| eslint-plugin-import-x | `^4.16` | `import/*` rules on ESLint 9/10 |
| eslint-import-resolver-typescript | `^4.4` | `import/no-unresolved` with TS path aliases |

EditorConfig, `AGENTS.md`, and Cursor rules have no toolchain version.

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

The installer only copies files. It prints a versioned `npm i -D` command and warns if the destination `package.json` is below the floors above. In the consuming project:

```bash
npm i -D typescript@">=5.6.0" eslint@">=9.22.0" typescript-eslint @eslint/js prettier eslint-config-prettier @stylistic/eslint-plugin eslint-plugin-import-x eslint-import-resolver-typescript
```

`@eslint/js` must match the ESLint major (`9` or `10`).
