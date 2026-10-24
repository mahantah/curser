# Architecture: layers and facades

## Layers

```
entry      API handlers, CLI commands, UI, scheduled jobs. Parse input, call one service, shape output.
service    Business logic and use cases. No framework objects, no SQL, no raw HTTP.
repository Data access (database, cache, files). Returns domain models.
client     External APIs and SDKs, wrapped so vendor types never leak out.
model      Domain types (dataclasses, DTOs, entities, enums). No I/O.
```

Each layer imports only from the layers below it. A typical Python layout:

```
src/app/
  api/          # entry
  services/     # business logic
  repositories/ # data access
  clients/      # external APIs
  models/       # domain types
  config/       # typed config loader + schema
config/
  base.yaml
  production.yaml
```

### Enforcing the layers

- Python, `import-linter` (`pyproject.toml`):

```toml
[tool.importlinter]
root_package = "app"

[[tool.importlinter.contracts]]
name = "layers"
type = "layers"
layers = ["app.api", "app.services", "app.repositories | app.clients", "app.models"]
```

- TypeScript: `dependency-cruiser` rules, or `eslint-plugin-boundaries`; feature folders expose only an `index.ts`.
- Java / Kotlin: ArchUnit tests (`layeredArchitecture().whereLayer("Service").mayOnlyBeAccessedByLayers("Api")`).
- Go: `internal/` packages so other modules cannot import internals; `depguard` in golangci-lint.
- C#: separate projects per layer with only the allowed project references; NetArchTest for rules.

## Facade for big services

A big service (payments, auth, search, notifications, a vendor API) gets one public class. Callers see
only it; everything behind it is private to the package and can be refactored freely.

### Python

```python
@dataclass(frozen=True)
class ChargeResult:
    """The outcome of charging an order."""

    receipt_id: str
    amount_cents: int


class PaymentsFacade:
    """The only entry point to payments. Callers never import from payments internals."""

    def __init__(self, gateway: PaymentGateway, ledger: LedgerRepository, config: PaymentsConfig) -> None:
        """Builds the facade from its collaborators.

        Args:
            gateway: The card provider client.
            ledger: Where every charge is recorded.
            config: Payment limits and retry settings from YAML.
        """
        self._gateway = gateway
        self._ledger = ledger
        self._config = config

    def charge_order(self, order: Order) -> ChargeResult:
        """Charges an order's total and records it in the ledger.

        Args:
            order: The order to charge.

        Returns:
            The receipt id and the charged amount.

        Raises:
            PaymentDeclined: If the provider declines the card.
        """
        receipt = self._gateway.charge(order.customer_id, order.total_cents, retries=self._config.retries)
        self._ledger.record(order.id, receipt)
        return ChargeResult(receipt_id=receipt.id, amount_cents=order.total_cents)
```

Package layout: `payments/__init__.py` exports only `PaymentsFacade` and its DTOs; `payments/_gateway.py`,
`payments/_ledger.py` stay internal.

### TypeScript

```ts
/** The only entry point to payments. */
export class PaymentsFacade {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly ledger: LedgerRepository,
    private readonly config: PaymentsConfig,
  ) {}

  /** Charges an order's total and records it. */
  async chargeOrder(order: Order): Promise<ChargeResult> {
    const receipt = await this.gateway.charge(order.customerId, order.totalCents, this.config.retries);
    await this.ledger.record(order.id, receipt);
    return { receiptId: receipt.id, amountCents: order.totalCents };
  }
}
```

`payments/index.ts` exports only `PaymentsFacade` and its types.

### Go

```go
// Payments is the only entry point to the payments package; its internals live in internal/.
type Payments struct {
	gateway Gateway
	ledger  Ledger
	cfg     Config
}

// NewPayments builds the facade from its collaborators.
func NewPayments(g Gateway, l Ledger, cfg Config) *Payments { return &Payments{g, l, cfg} }

// ChargeOrder charges an order's total and records it.
func (p *Payments) ChargeOrder(ctx context.Context, o Order) (ChargeResult, error) { /* ... */ }
```

### Signs a module needs a facade

- Callers import from many files inside it.
- Vendor or ORM types show up in callers' code.
- A change inside it forces changes in unrelated callers.
- Tests need to mock several of its internals.

Introduce the facade first, move callers onto it one by one, then refactor behind it.
