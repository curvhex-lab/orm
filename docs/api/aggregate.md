# aggregate

Computes statistics over a filtered set of accounts.

## Signature

```typescript
aggregate(options: AggregateOptions<M>): Promise<AggregateResult<M>>
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `where` | `WhereClause<M>` | Filter the accounts to aggregate |
| `_count` | `true` | Count matching accounts |
| `_sum` | `{ [numericField]: true }` | Sum of each field |
| `_avg` | `{ [numericField]: true }` | Average of each field |
| `_min` | `{ [numericField]: true }` | Minimum of each field |
| `_max` | `{ [numericField]: true }` | Maximum of each field |

## Example

```typescript
const stats = await orm.models.userAccount.aggregate({
  where:  { isActive: true },
  _count: true,
  _sum:   { balance: true },
  _avg:   { balance: true },
  _min:   { balance: true },
  _max:   { balance: true },
})

console.log(stats._count)           // 142
console.log(stats._sum.balance)     // 5_000_000n
console.log(stats._avg.balance)     // 35_211n  (truncated bigint division)
console.log(stats._min.balance)     // 100n
console.log(stats._max.balance)     // 500_000n
```

## Multiple Fields

```typescript
const stats = await orm.models.position.aggregate({
  _sum: { collateral: true, size: true },
  _avg: { leverage: true },
  _max: { pnl: true },
})
```

## Notes

- Only numeric fields (`u8`–`u128`, `i8`–`i128`) are valid in `_sum`, `_avg`, `_min`, `_max`.
- `_avg` on `bigint` fields (`u64`, `u128`, `i64`, `i128`) uses integer division — decimal precision is not preserved.
- With `RpcAdapter`, all matching accounts are fetched before aggregating. `PostgresAdapter` will run these as `SUM()`, `AVG()` SQL functions.
