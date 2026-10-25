# clean-code برای ChatGPT

این اسکیل مال مدل خاصی نیست. در Cursor فایل `SKILL.md` را ایجنت می‌خواند. در ChatGPT باید خودتان آن را به چت بدهید.

منبع: https://github.com/SinaFtpAi/clean-code-skill (MIT)

## راه سریع — Custom Instructions یا Project

Settings → Personalization → Custom instructions  
یا داخل یک Project → Instructions  
این متن را بچسبانید:

```
Follow these clean-code rules in every change. Keep the project's own conventions; never rewrite the whole repo in one step.

1. Separation of concerns: entry -> service -> repository/client -> model. Pure logic apart from I/O.
2. Every big service has one facade; callers use only the facade.
3. Nothing hard-coded: tunables in validated YAML config, secrets as ${ENV} references.
4. Strict typing everywhere, no any.
5. Classes over loose functions; dependencies through the constructor.
6. Strict linter + formatter + type checker, zero warnings, run the project check command before finishing.
7. Comments explain why; every public function has a docstring (Google style in Python).
8. No dead code and no commented-out code; deprecated code says so in its own docstring.

When writing code: confirm it is still used, put the change in the right layer, move tunables to config, update docstrings, delete what you made obsolete, then run checks.

When asked to clean a repo: map it, find problems with evidence, report a table first unless I already asked you to fix, then fix in small batches (tooling, dead code, config, types, facades, docs).
```

## راه کامل — آپلود فایل

در همان Project یا Custom GPT این فایل‌ها را به‌عنوان Knowledge آپلود کنید:

- `SKILL.md`
- `references/architecture.md`
- `references/config.md`
- `references/dead-code.md`
- `references/docstrings.md`
- `references/typing-and-linting.md`

بعد در چت بنویسید: `Follow the clean-code skill.` یا `این ریپو را تمیز کن`.

## چه کار نمی‌کند

ChatGPT افزونهٔ `/plugin install` مثل Claude Code ندارد. بدون این دستورالعمل، خودش اسکیل را بار نمی‌کند.
