# findByAddress

Fetches a single account by its public key. Always hits the RPC directly, bypassing any indexer lag.

## Signature

```typescript
findByAddress(address: string): Promise<(InferModel<M> & { address: string }) | null>
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `address` | `string` | The account's public key as a base58 string |

## Example

```typescript
const user = await orm.models.userAccount.findByAddress('Abc123...')

if (user) {
  console.log(user.balance) // bigint
}
```

## Notes

- Returns `null` if the account does not exist.
- The account is deserialized using the model's schema — if the account data does not match the schema (wrong discriminator, wrong size), an error is thrown.
- Use this method when you need the freshest possible on-chain state, e.g. before submitting a transaction that depends on the account's current value.
