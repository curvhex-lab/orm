# count

Returns the number of accounts matching a filter.

## Signature

```typescript
count(where?: WhereClause<M>): Promise<number>
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `where` | `WhereClause<M>` | Optional filter. If omitted, counts all accounts of this type. |

## Examples

```typescript
// Count all accounts
const total = await orm.models.userAccount.count()

// Count with filter
const activeCount = await orm.models.userAccount.count({ isActive: true })

// Count with range filter
const richCount = await orm.models.userAccount.count({
  balance: { gte: 10_000n },
})
```

## Notes

With `RpcAdapter`, all matching accounts are fetched before counting — the result is accurate but incurs a full `getProgramAccounts` call. `PostgresAdapter` will push this to a `SELECT COUNT(*)` query.
