# Aggregations

Curvhex ORM provides `count`, `aggregate`, and `groupBy` for computing statistics over on-chain accounts.

## `count`

Returns the number of accounts matching a filter.

```typescript
const activeUsers = await orm.models.userAccount.count({ isActive: true })
// → 142

const allUsers = await orm.models.userAccount.count()
// → 200
```

## `aggregate`

Computes numeric statistics over a filtered set of accounts.

```typescript
const stats = await orm.models.userAccount.aggregate({
  where: { isActive: true },

  _count: true,                 // total matching accounts
  _sum:   { balance: true },    // sum of balance
  _avg:   { balance: true },    // average balance
  _min:   { balance: true },    // minimum balance
  _max:   { balance: true },    // maximum balance
})
```

**Result:**

```typescript
{
  _count: 142,
  _sum:   { balance: 5_000_000n },
  _avg:   { balance: 35_211n },   // note: bigint division truncates
  _min:   { balance: 100n },
  _max:   { balance: 500_000n },
}
```

::: tip Multiple Fields
You can aggregate multiple numeric fields in a single call:

```typescript
const stats = await orm.models.position.aggregate({
  _sum: { collateral: true, size: true },
  _avg: { leverage: true },
})
```
:::

## `groupBy`

Groups accounts by one or more fields and runs aggregations per group.

```typescript
const byTier = await orm.models.userAccount.groupBy({
  by:     ['tier'],
  where:  { isActive: true },
  _count: true,
  _sum:   { balance: true },
})
```

**Result:**

```typescript
[
  { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
  { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
]
```

### Multiple Grouping Keys

```typescript
const breakdown = await orm.models.userAccount.groupBy({
  by:     ['tier', 'isActive'],
  _count: true,
  _avg:   { balance: true },
})
// → [
//     { tier: 1, isActive: true,  _count: 95,  _avg: { balance: 28000n } },
//     { tier: 1, isActive: false, _count: 7,   _avg: { balance: 5000n  } },
//     { tier: 2, isActive: true,  _count: 40,  _avg: { balance: 50000n } },
//   ]
```

## Performance

With `RpcAdapter`, all aggregations run **client-side**: all matching accounts are fetched, then stats are computed in memory. This works well for programs with up to a few thousand accounts.

For larger programs, `HeliusAdapter` and `PostgresAdapter` *(coming soon)* run aggregations server-side, avoiding the data transfer cost entirely.
