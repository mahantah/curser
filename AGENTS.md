# Agent notes

When writing or changing code, read `.cursor/skills/clean-code/SKILL.md`.

## Code rules

1. Separation of concerns: entry -> service -> repository/client -> model. Pure logic apart from I/O.
2. Every big service has one facade; callers use only the facade.
3. Nothing hard-coded: tunables in validated YAML config, secrets as ${ENV} references.
4. Strict typing everywhere, no any.
5. Classes over loose functions; dependencies through the constructor.
6. Strict linter + formatter + type checker, zero warnings, run the project check command before finishing.
7. Comments explain why; every public function has a docstring (Google style in Python).
8. No dead code and no commented-out code; deprecated code says so in its own docstring.

Source: [SinaFtpAi/clean-code-skill](https://github.com/SinaFtpAi/clean-code-skill) (MIT).
