---
name: clean-code
description: "Keep a codebase clean for AI agents: separation of concerns with layers, a facade in front of every big service, no hard-coded values (everything in validated YAML config), strict typing, classes over loose functions, strict linting per language, correct comments and docstrings, and no dead or commented-out code. Use when writing or changing code, reviewing a diff, setting up a new project, or when asked to audit or clean up a codebase (clean this repo, find dead code, add docstrings, add linting, remove hard-coded values, make this codebase agent friendly)."
metadata:
  surfaces:
    - ide
    - cloud
---

# Clean code for agents

Adapted for Cursor from [SinaFtpAi/clean-code-skill](https://github.com/SinaFtpAi/clean-code-skill) (MIT, Sina Fathpour).

Read this skill when writing or changing code, reviewing a diff, setting up a project, or when asked to audit or clean up a codebase. Follow the references in this folder for language-specific detail.

An agent starts every session from zero. It does not remember why the code looks the way it does; it
reads what is there and copies the patterns it sees. A messy codebase makes it read many files for a
small change, burn tokens, and still guess. Dead code is worse: the agent cannot tell it is dead, so it
keeps updating code that no longer runs. Cleaning once is cheaper than paying for the mess in every
session.

Follow these rules in every change you make, and use them as the checklist for audits. When a project
already has its own conventions, keep them and apply these rules inside them; never reorganise a whole
codebase in one change.

## Rule 1: separation of concerns

- One module, class or function has one responsibility. If you need "and" to describe it, split it.
- Code is layered, and each layer only talks to the one below it:
  `entry (API handler, CLI, UI, job) -> service (business logic) -> repository / client (data, external APIs) -> model`.
  No business logic in handlers or views, no queries or HTTP calls outside repositories and clients, no framework
  objects (requests, ORM rows) leaking into the domain logic.
- Pure logic (calculations, parsing, formatting, rules) sits apart from I/O, so it can be tested
  without a database or network.
- Shared helpers live in one obvious place. Never copy a helper into a second file; import it.
- Folder and file names say what is inside, so the right file is found without opening ten others.
- Enforce the layers with a tool where the language has one (import-linter for Python,
  dependency-cruiser or eslint-plugin-boundaries for TypeScript, ArchUnit for Java/Kotlin).
  See `references/architecture.md`.

## Rule 2: a facade in front of every big service

- A service or subsystem with more than a few classes (payments, auth, search, notifications, an
  external API) exposes ONE facade class. The rest of the code calls only the facade; its internals
  stay private to its package.
- The facade's methods are named after use cases (`charge_order`, `refund`), not after internal steps.
  It takes and returns plain typed objects (dataclasses, DTOs), never internal or vendor types.
- The facade gets its collaborators through the constructor (dependency injection), so tests can pass
  fakes and the vendor can be swapped without touching callers.
- When a module grows big, add the facade first, move callers onto it, then refactor behind it.
  See `references/architecture.md` for the pattern in several languages.

## Rule 3: nothing hard-coded, everything in YAML config

- No magic numbers or strings in logic: limits, timeouts, retry counts, URLs, feature flags, model
  names, prices, paths, thresholds and copy that may change all live in YAML config files.
- Config is loaded ONCE by a config loader, validated against a typed schema (pydantic, zod, a struct
  with validation) at startup, and passed in as typed objects. A missing or wrong value fails at
  startup, not in the middle of a request.
- Secrets never go in YAML or code. YAML references them as `${ENV_VAR}`, and only the config loader
  reads the environment.
- One base file plus small per-environment overrides (`config/base.yaml`, `config/production.yaml`),
  not copies. Every key has a comment saying what it does and its unit.
- Real constants (math constants, protocol values, enum members) are named constants, not config.
  See `references/config.md`.

## Rule 4: strict typing

- Type every function signature, attribute and return value. Use the strictest mode the language
  offers (`mypy --strict` or pyright strict, TypeScript `strict: true`, no implicit any).
- No `any` / `Any` / `interface{}` / `Object` escape hatches. If one is truly needed, keep it at the
  boundary with a comment explaining why, and convert to a real type right away.
- Model data with types, not dicts: dataclasses or pydantic models, TypeScript types and zod schemas,
  structs, records, enums for fixed sets of values.
- Validate untyped input (HTTP bodies, files, env, LLM output) at the boundary and turn it into typed
  objects once. See `references/typing-and-linting.md`.

## Rule 5: classes over loose functions

- Group logic into classes with one responsibility each: services, repositories, clients,
  validators, formatters, commands. State and collaborators come in through the constructor.
- Prefer small classes with clear public methods over a module full of free functions that pass the
  same five arguments around.
- Use free functions only where the framework requires them (route decorators, entry points, hooks,
  React function components) or for a truly stateless one-liner, and keep them thin: they call a class.
- Composition over inheritance; inheritance only for a real "is a" relationship, never just to share code.

## Rule 6: strict linting and formatting

- Every project has a linter, a formatter and a type checker configured in the repo, strict, with zero
  warnings, and one command that runs them all (`make check`, `npm run check`, `just check`).
- Python: `ruff` (lint with a broad rule set, ideally `select = ["ALL"]` with a few documented
  ignores) + `ruff format` + `mypy --strict`. Other languages: see `references/typing-and-linting.md`
  (TypeScript, JavaScript, Go, Rust, Java, Kotlin, C#, Swift, PHP, Ruby, C/C++, Dart, shell, YAML).
- No unexplained ignores. Every `noqa`, `eslint-disable`, `#[allow]` or `@Suppress` has a reason next to it.
- Run the check before you say a change is done, and fix what it reports.

## Rule 7: comments are correct, and every function has a docstring

- Every public module, class and function has a docstring. In Python use Google style
  (`Args:`, `Returns:`, `Raises:`). In other languages use the native format with the same sections
  (TSDoc/JSDoc, GoDoc, KDoc, Javadoc, rustdoc, XML docs). See `references/docstrings.md`.
- A docstring says what the code does, what it takes and returns, and what can fail. It does not retell
  the code line by line.
- Comments explain WHY (a constraint, a workaround, a decision), never WHAT the next line does.
- A wrong comment is worse than none. When you change code, update every comment and docstring that
  describes it in the same change.
- Mark deprecated code where the agent will see it: in the docstring of the thing itself.

## Rule 8: no dead code, no commented-out code

- Delete code that nothing calls: unused functions, classes, files, routes, flags, config keys,
  toggles that are always on or off, and old versions of something that was replaced.
- Delete commented-out code. Git keeps the history.
- Keep old code only with a real reason (a public API clients still call during a migration). Then it
  says so in its own docstring: deprecated, since when, what replaces it, when it goes.
- When you replace something, remove the old version in the same change. Never leave two live-looking
  versions of the same feature. See `references/dead-code.md`.

## When writing or changing code

1. Before editing, check that the code you are about to touch is still used (callers, routes, imports,
   config references). Never update dead code; tell the user it looks dead instead.
2. Put the change in the right layer, behind the right facade (rules 1 and 2), as a typed class
   (rules 4 and 5).
3. Any value that could change goes into the YAML config and its schema (rule 3).
4. Add or update docstrings and comments for everything you touched (rule 7).
5. Remove whatever your change made obsolete (rule 8).
6. Run the project's lint, format, type check and tests (rule 6). Fix everything.
7. In your summary, list problems you noticed but did not fix (dead code, hard-coded values, missing types).

## When setting up a new project

Create from the start: the folder layout with layers, `config/base.yaml` plus the typed config loader,
the linter, formatter and type checker in strict mode, one `check` command, a test runner, and an
`AGENTS.md` with the short form below.

## When asked to audit or clean up a codebase

Work in small, reviewable steps; never one giant rewrite.

1. **Map it.** Top-level structure, entry points (routes, CLI commands, jobs, exports), the big
   services, the config files, the lint and test commands. Run the checks and tests once so you know
   the starting state.
2. **Find problems** per rule: dead code (`references/dead-code.md`), hard-coded values (search for
   literals in logic: URLs, numbers, model names), missing types, layer violations, big modules without
   a facade, missing docstrings, linter gaps. For every dead code candidate, prove it is unused.
3. **Report before changing.** A table: problem, location, rule, evidence, risk (safe / check with the
   owner), suggested fix. Wait for the user's go-ahead unless they already asked you to fix.
4. **Fix in batches,** in this order: add the strict tooling (so later batches are checked), delete
   dead code, move hard-coded values to config, add types, add facades and fix layers, fix docstrings
   and comments. One commit or PR per batch, checks and tests passing after each one.
5. **Leave it clean:** add the short form below to `AGENTS.md`.

## Short form for AGENTS.md

```markdown
## Code rules
1. Separation of concerns: entry -> service -> repository/client -> model. Pure logic apart from I/O.
2. Every big service has one facade; callers use only the facade.
3. Nothing hard-coded: tunables in validated YAML config, secrets as ${ENV} references.
4. Strict typing everywhere, no any.
5. Classes over loose functions; dependencies through the constructor.
6. Strict linter + formatter + type checker, zero warnings, run `<check command>` before finishing.
7. Comments explain why; every public function has a docstring (Google style in Python).
8. No dead code and no commented-out code; deprecated code says so in its own docstring.
```
