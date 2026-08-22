<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `vp dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `vp dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

## Coding preferences (General)

- Keep things simple. Channel "yagni" energy unless told otherwise.
- Keep components modular and concerns clearly separated.
- Take advantage of type safety.
- Treat the prompt as the specification. Verify assumptions against the repository.
- Use established project dependencies before writing custom code or adding packages.
- Make durable architectural decisions. Do not add a temporary path that is intended to be replaced later.
- Comment intent, constraints, and non-obvious behavior. Keep comments up to date, when making changes it's improtant to keep things in sync.
- Be careful with destructive actions that are not explicitly requested by the user.
- Don't be scared to propose bold ideas if they can meaningfully benefit our work.
- Do not preserve backward compatibility unless the task requires it. Remove obsolete paths instead of adding compatibility layers, fallbacks, or migrations.
- Do not create endless smoke tests and "regression tests" for feature deletions. Tests should be focused.

## Coding preferences (TypeScript focused)

- `any` is the enemy, Infered types are our friend. Our systems should adapt to changes, instead of requiring chnages everywhere.
- Avoid one-line functions that are just casting wrappers.
- If not already specified in the project, the generally preferred stack is Vite+, React, and Tailwind CSS.
- When building more complex web apps, pull out TanStack Query, TanStack Start or Router (for SPA), zod.
- When schema changes are required, create migrations with `vp run db:generate`.
- Apply local schema changes with `vp run db:migrate`.
- Do not hand-write migration SQL.

## Coding preferences (Frontend focused)

- Follow shadcn principles. Prefer adapting the local UI kit over one-off bespoke styling.
- Keep `src/components/ui/*` for shadcn primitives and direct extensions. Use `shadcn add` before creating a primitive manually, import primitives directly, and do not re-export them through app helpers.
- Prefer compound components, compose visible content as children instead of passing JSX, labels, icons, or content through props. Prefer `<Component><ComponentHeader>...</ComponentHeader></Component>` style for presentational wrappers.
- Do not create useless wrappers around base primitives like `Card` - reuse base primitives unless it's required.
- Do not create catch-all helper buckets such as `src/components/app/*`, route-root `-components/ui.tsx`, or broad `primitives.tsx` modules. If a component is shared, give it a specific top-level home under `src/components`.
- Keep route-local `-components` folders only when the components are genuinely scoped to that route subtree. If a route-local component is imported across multiple areas, move it to a named shared component file instead.
- Keep the visual hierarchy restrained: use sentence case, avoid decorative gradients, and prefer layout, spacing, and separators over excessive or nested cards.
- Use shadcn `Field` primitives for form layout.
- Keep navigation at the call site. Compose TanStack `Link` with `asChild`; do not pass routes into presentational components or create `LinkButton`.
- Use the shared loading and error components, use shadcn empty-state primitives directly.
- Do not create fake, decorative, or non-working controls unless asked.
- Do not use uppercase section or metric titles.
- Put non-visual formatting and grouping helpers in `src/lib/*`.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp run -r test` to validate changes across the workspace.

<!--VITE PLUS END-->
