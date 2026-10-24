# Typing and linting per language

Every project needs a linter, a formatter and a type checker, all strict, with zero warnings, run by
one command. Below are strict starting points; keep the project's existing tools if it has them, and
make them stricter.

## Python

Tools: `ruff` (lint + format), `mypy --strict` (or `pyright` strict), `pytest`.

```toml
# pyproject.toml
[tool.ruff]
line-length = 120
target-version = "py312"

[tool.ruff.lint]
select = ["ALL"]
ignore = [
  "D203", "D213",   # conflict with D211 / D212
  "COM812",         # conflicts with the formatter
]

[tool.ruff.lint.pydocstyle]
convention = "google"

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101", "D"]   # asserts and docstrings are fine to skip in tests

[tool.mypy]
strict = true
warn_unreachable = true
```

```bash
ruff check . && ruff format --check . && mypy src
```

Typing: dataclasses or pydantic models for data, `Protocol` for interfaces, `Enum` / `Literal` for fixed
sets, `Final` for constants. No `Any`, no bare `dict` as a data model.

## TypeScript

Tools: `tsc` strict, ESLint with `typescript-eslint` strict type-checked rules, Prettier (or Biome for all three).

```json
// tsconfig.json (compilerOptions)
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
}
```

```js
// eslint.config.js
import tseslint from "typescript-eslint";
export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { projectService: true } } },
  { rules: { "@typescript-eslint/no-explicit-any": "error", "no-magic-numbers": ["error", { ignore: [0, 1, -1] }] } },
);
```

```bash
tsc --noEmit && eslint . --max-warnings 0 && prettier --check .
```

Typing: `type`/`interface` for data, zod at boundaries, `unknown` instead of `any`, discriminated unions
instead of optional flags.

## JavaScript

Prefer migrating to TypeScript. Until then: ESLint (`@eslint/js` recommended + `eslint-plugin-jsdoc`),
Prettier, and `// @ts-check` with JSDoc types checked by `tsc --checkJs`.

## Go

Tools: `gofmt` / `goimports`, `go vet`, `golangci-lint` with a broad set.

```yaml
# .golangci.yml
linters:
  enable: [errcheck, govet, staticcheck, unused, gosec, revive, gocritic, errorlint, wrapcheck, depguard, mnd]
```

```bash
gofmt -l . && go vet ./... && golangci-lint run
```

Typing: named types for IDs and units (`type OrderID string`), no `interface{}` / `any` in APIs, errors wrapped with `%w`.

## Rust

Tools: `rustfmt`, `clippy` with pedantic lints, the compiler's own warnings as errors.

```toml
# Cargo.toml
[lints.rust]
unsafe_code = "forbid"
missing_docs = "warn"

[lints.clippy]
pedantic = { level = "warn", priority = -1 }
unwrap_used = "warn"
expect_used = "warn"
```

```bash
cargo fmt --check && cargo clippy --all-targets -- -D warnings
```

## Java

Tools: Checkstyle (Google style), SpotBugs, Error Prone + NullAway, Spotless (google-java-format).

```bash
./gradlew spotlessCheck checkstyleMain spotbugsMain build
```

Typing: records for data, `Optional` for absent values, no raw types, `@Nullable` annotations checked by NullAway.

## Kotlin

Tools: ktlint (or Spotless with ktlint), detekt, the compiler with `allWarningsAsErrors = true`.

```bash
./gradlew ktlintCheck detekt build
```

## C# / .NET

Tools: `dotnet format`, Roslyn analyzers, nullable reference types.

```xml
<!-- Directory.Build.props -->
<PropertyGroup>
  <Nullable>enable</Nullable>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  <AnalysisLevel>latest-all</AnalysisLevel>
  <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
</PropertyGroup>
```

```bash
dotnet format --verify-no-changes && dotnet build -warnaserror
```

## Swift

Tools: SwiftLint (strict), swift-format, Swift 6 strict concurrency.

```bash
swiftlint --strict && swift format lint --recursive Sources
```

## PHP

Tools: PHPStan at max level (or Psalm), PHP-CS-Fixer or PHP_CodeSniffer (PSR-12), `declare(strict_types=1);` in every file.

```bash
vendor/bin/phpstan analyse --level=max src && vendor/bin/php-cs-fixer fix --dry-run --diff
```

## Ruby

Tools: RuboCop (with rubocop-performance, rubocop-rails if Rails), Sorbet or RBS + Steep for types.

```bash
bundle exec rubocop && bundle exec srb tc
```

## C / C++

Tools: clang-format, clang-tidy (bugprone, modernize, readability, cppcoreguidelines), compiler warnings as errors.

```bash
clang-format --dry-run --Werror src/*.cpp && clang-tidy src/*.cpp -- -std=c++20
# compile with: -Wall -Wextra -Wpedantic -Werror
```

## Dart / Flutter

Tools: `dart format`, `dart analyze` with `very_good_analysis` or `flutter_lints` and strict modes.

```yaml
# analysis_options.yaml
include: package:very_good_analysis/analysis_options.yaml
analyzer:
  language: { strict-casts: true, strict-inference: true, strict-raw-types: true }
```

## Shell, YAML, Docker, SQL

- Shell: `shellcheck` + `shfmt`; scripts start with `set -euo pipefail`.
- YAML: `yamllint`; config also validated by the app's schema.
- Dockerfile: `hadolint`.
- SQL: `sqlfluff`.

## Ignores

Every suppression (`# noqa: XXX`, `# type: ignore[code]`, `// eslint-disable-next-line rule`,
`#[allow(...)]`, `@Suppress`, `//nolint:name`) names the exact rule and has a short reason next to it.
Never disable a rule for a whole file without a comment explaining why.
