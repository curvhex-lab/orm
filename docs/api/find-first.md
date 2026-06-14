# findFirst

Returns the first matching account, or `null` if none found.

## Signature

```typescript
findFirst(options?: FindManyOptions<M>): Promise<(InferModel<M> & { address: string }) | null>
```

Accepts the same options as [`findMany`](/api/find-many).

## Example

```typescript
const user = await orm.models.userAccount.findFirst({
  where:   { authority: wallet.publicKey.toBase58() },
  orderBy: { balance: 'desc' },
})

if (user) {
  console.log(user.balance) // bigint
} else {
  console.log('not found')
}
```

## Notes

- Internally calls `findMany` with the same options and returns the first element.
- To ensure a deterministic result when multiple accounts could match, use `orderBy`.
