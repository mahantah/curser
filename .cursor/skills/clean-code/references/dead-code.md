# Finding dead code

Tools give candidates, not proof. Confirm every candidate before deleting it.

## Tools by language

| Language | Tool | Command |
|---|---|---|
| Python | vulture | `uvx vulture src/ --min-confidence 80` |
| Python | ruff (unused imports and variables, commented-out code) | `ruff check --select F401,F841,ERA001 .` |
| TypeScript / JS | knip (unused files, exports, dependencies) | `npx knip` |
| TypeScript | tsc (unused locals) | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` |
| Go | staticcheck (U1000 unused) | `staticcheck ./...` |
| Go | deadcode | `go run golang.org/x/tools/cmd/deadcode@latest ./...` |
| Rust | compiler and clippy | `cargo clippy -- -W dead_code` |
| Any | coverage from the test suite | code never executed by tests is a candidate, not proof |

## Proving something is unused

1. Search for every reference to the name: `git grep -n "name"` (also check string forms, for example
   route names, task names, event names, template tags).
2. Check dynamic use: registries, plugin loaders, `getattr`, reflection, dependency injection,
   serializers, admin registrations, URL configs, cron and queue configs, feature flag configs.
3. Check the public surface: exported package APIs, HTTP routes called by other services or apps,
   CLI commands, database migrations (never delete applied migrations).
4. Check git history for why it exists: `git log -S "name" --oneline`.
5. If still unsure, mark it "check with the owner" in the report instead of deleting.

## Old versions of a replaced feature

Look for pairs like `login` and `login_v2`, `old_`, `legacy_`, `_backup`, `deprecated` folders, and
two routes or handlers doing the same job. Find which one is wired to the entry points; the other is
dead (or needs a deprecation docstring if it must stay).

## Commented-out code

Search for blocks of commented lines that parse as code (ruff `ERA001` in Python; a regex such as
`^\s*(//|#)\s*(def|function|class|return|if|for|const|let|import)\b` elsewhere). Delete them; git
keeps the history.
