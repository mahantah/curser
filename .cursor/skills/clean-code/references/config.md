# Config: nothing hard-coded

## What goes in YAML

Anything that could change without the logic changing: limits, timeouts, retry counts, page sizes,
URLs, feature flags, model names, prices, thresholds, paths, schedules, user-facing copy.

What stays in code: real constants (math, protocol values), enum members, type definitions.

## Layout

```yaml
# config/base.yaml
payments:
  retries: 3            # attempts per charge before giving up
  timeout_s: 10         # provider request timeout, seconds
  max_charge_cents: 500000
  provider_url: https://api.provider.example
  api_key: ${PAYMENTS_API_KEY}   # secret: from the environment, never written here
search:
  page_size: 20
```

```yaml
# config/production.yaml (only the overrides)
payments:
  timeout_s: 5
```

## Python loader (pydantic)

```python
class PaymentsConfig(BaseModel):
    """Payment settings from config/*.yaml."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    retries: int = Field(ge=0)
    timeout_s: float = Field(gt=0)
    max_charge_cents: int = Field(gt=0)
    provider_url: HttpUrl
    api_key: SecretStr


class AppConfig(BaseModel):
    """The whole validated config."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    payments: PaymentsConfig


class ConfigLoader:
    """Loads base.yaml plus the environment's overrides, expands ${VAR}, validates once."""

    _ENV_REF = re.compile(r"\$\{([A-Z0-9_]+)\}")

    def __init__(self, config_dir: Path, environment: str) -> None:
        """Remembers where the files are.

        Args:
            config_dir: The folder with base.yaml and the per-environment files.
            environment: The override file name without extension, for example "production".
        """
        self._dir = config_dir
        self._environment = environment

    def load(self) -> AppConfig:
        """Reads, merges, expands and validates the config.

        Returns:
            The validated, immutable config.

        Raises:
            pydantic.ValidationError: If a value is missing or has the wrong type.
            KeyError: If a referenced environment variable is not set.
        """
        data = self._merge(self._read("base"), self._read(self._environment))
        return AppConfig.model_validate(self._expand(data))
    # _read, _merge (deep merge) and _expand (replace ${VAR} from os.environ) are small private methods.
```

Load it once at startup and pass `config.payments` into the classes that need it. Nothing else reads
`os.environ` or the YAML files.

## TypeScript loader (zod)

```ts
const PaymentsConfig = z.object({
  retries: z.number().int().min(0),
  timeoutS: z.number().positive(),
  providerUrl: z.string().url(),
  apiKey: z.string().min(1),
}).strict();

/** Loads and validates config/*.yaml once at startup. */
export class ConfigLoader {
  constructor(private readonly dir: string, private readonly env: string) {}
  load(): AppConfig { /* read with `yaml`, deep merge, expand ${VAR}, AppConfig.parse(data) */ }
}
```

## Other languages

- Go: `gopkg.in/yaml.v3` into a struct, `go-playground/validator` tags, or `koanf` for layering.
- Rust: `serde_yaml` + `serde` derive into structs, `figment` or `config` crate for layering, `validator`.
- Java / Kotlin: Spring Boot `application.yaml` with `@ConfigurationProperties` + `@Validated`; Hoplite for Kotlin.
- C#: `appsettings.yaml` via NetEscapades.Configuration.Yaml, bound with the Options pattern + validation.

## Finding hard-coded values

Search logic files (not tests, not config) for literals: URLs (`https?://`), numbers other than 0, 1
and -1, model names, quoted file paths, durations (`sleep(`, `timeout=`), and repeated string literals.
Ruff's `PLR2004` (magic values) and ESLint's `no-magic-numbers` find many of them.
