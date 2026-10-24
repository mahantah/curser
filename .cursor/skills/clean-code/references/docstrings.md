# Docstrings

## Python (Google style)

```python
def charge(order_id: str, amount_cents: int) -> Receipt:
    """Charges the customer's saved card for an order.

    Args:
        order_id: The order to charge.
        amount_cents: The amount in cents; must be positive.

    Returns:
        The receipt from the payment provider.

    Raises:
        PaymentDeclined: If the provider declines the card.
    """
```

Classes describe what the object represents and list public attributes under `Attributes:`.
Modules start with a one line summary of what the module is for.

## Deprecated code (any language)

```python
def login_v1(request):
    """Old session based login.

    Deprecated: since 2026-03, replaced by `auth.login`. Kept only for the mobile app 4.x,
    remove after 2026-12. Do not change or extend.
    """
```

## TypeScript / JavaScript (TSDoc)

```ts
/**
 * Charges the customer's saved card for an order.
 *
 * @param orderId - The order to charge.
 * @param amountCents - The amount in cents; must be positive.
 * @returns The receipt from the payment provider.
 * @throws {PaymentDeclined} If the provider declines the card.
 */
export async function charge(orderId: string, amountCents: number): Promise<Receipt> {}
```

Mark deprecated code with `@deprecated Since 2026-03, use auth.login. Remove after 2026-12.`

## Go

```go
// Charge charges the customer's saved card for an order and returns the provider's receipt.
// It returns ErrDeclined if the provider declines the card.
func Charge(orderID string, amountCents int) (Receipt, error)
```

Deprecated: start a paragraph with `// Deprecated: use auth.Login.` (Go tooling reads it).

## Rust

```rust
/// Charges the customer's saved card for an order.
///
/// # Errors
/// Returns `PaymentError::Declined` if the provider declines the card.
pub fn charge(order_id: &str, amount_cents: u64) -> Result<Receipt, PaymentError>
```

Deprecated: `#[deprecated(since = "2.3.0", note = "use auth::login")]`.

## Comments

- Good: `# The provider rounds down, so we add the remainder here.` (why)
- Bad: `# Add one to i.` (what)
- Bad: a comment that describes how the code worked before the last change.

## Java (Javadoc) / Kotlin (KDoc)

```java
/**
 * Charges the customer's saved card for an order.
 *
 * @param orderId the order to charge
 * @param amountCents the amount in cents; must be positive
 * @return the receipt from the payment provider
 * @throws PaymentDeclinedException if the provider declines the card
 */
public Receipt charge(String orderId, long amountCents) { ... }
```

Deprecated: `@Deprecated(since = "2.3")` plus `@deprecated use {@link Auth#login}` in the Javadoc.
Kotlin uses the same tags in KDoc and `@Deprecated("use Auth.login", ReplaceWith("Auth.login()"))`.

## C# (XML docs)

```csharp
/// <summary>Charges the customer's saved card for an order.</summary>
/// <param name="orderId">The order to charge.</param>
/// <returns>The receipt from the payment provider.</returns>
/// <exception cref="PaymentDeclinedException">If the provider declines the card.</exception>
public Receipt Charge(string orderId, long amountCents) { ... }
```

Deprecated: `[Obsolete("Use Auth.Login. Remove after 2026-12.")]`.
