# Querying

Once you've defined your schema and created the ORM, you have a rich set of query methods on each model.

## `findMany`

Returns all matching accounts as an array.

```typescript
const users = await orm.models.userAccount.findMany({
  where:    { isActive: true },
  orderBy:  { balance: 'desc' },
  take:     20,
  skip:     0,
  dataSize: 165, // optional: filter by account byte size
})
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `where` | `WhereClause` | Filter conditions |
| `orderBy` | `{ field: 'asc' \| 'desc' }` | Sort results (client-side) |
| `take` | `number` | Limit number of results |
| `skip` | `number` | Offset for pagination |
| `dataSize` | `number` | Filter by exact account data size |
| `include` | `IncludeMap` | Load related accounts |

## `findFirst`

Returns the first matching account or `null`.

```typescript
const user = await orm.models.userAccount.findFirst({
  where:   { authority: wallet.publicKey.toBase58() },
  orderBy: { balance: 'desc' },
})
// → UserAccount | null
```

Equivalent to `findMany({ ...options, take: 1 })[0] ?? null`, but semantically cleaner for single-item lookups.

## `findByAddress`

Fetches a single account by its public key string. Always hits the RPC directly — bypasses any indexer lag.

```typescript
const user = await orm.models.userAccount.findByAddress('Abc123...')
// → UserAccount | null
```

::: tip Consistency
Use `findByAddress` or `findByPda` when you need the latest on-chain state before submitting a transaction. Off-chain adapters may lag 1–2 slots behind.
:::

## `findByPda`

Derives the PDA from seeds and program ID, then fetches the account.

```typescript
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])
// → UserAccount | null
```

Seeds can be any combination of `Buffer` or `Uint8Array`.

## `count`

Returns the number of accounts matching a filter.

```typescript
const total = await orm.models.userAccount.count({ isActive: true })
// → 142
```

Pass no argument to count all accounts of this type:

```typescript
const total = await orm.models.userAccount.count()
```

## `aggregate`

Computes statistics over a set of accounts.

```typescript
const stats = await orm.models.userAccount.aggregate({
  where: { isActive: true },
  _count: true,
  _sum:   { balance: true },
  _avg:   { balance: true },
  _min:   { balance: true },
  _max:   { balance: true },
})

// → {
//     _count: 142,
//     _sum:   { balance: 5_000_000n },
//     _avg:   { balance: 35211n },
//     _min:   { balance: 100n },
//     _max:   { balance: 500_000n },
//   }
```

## `groupBy`

Groups accounts by one or more fields and runs aggregations per group.

```typescript
const byTier = await orm.models.userAccount.groupBy({
  by:     ['tier'],
  where:  { isActive: true },
  _count: true,
  _sum:   { balance: true },
})

// → [
//     { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
//     { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
//   ]
```

Multiple grouping keys:

```typescript
const byTierAndActive = await orm.models.userAccount.groupBy({
  by: ['tier', 'isActive'],
  _count: true,
})
```

## Result Shape

Every result includes the account's `address` (public key as base58 string) alongside the deserialized fields:

```typescript
{
  address:   'Abc123...',
  authority: 'Xyz456...',
  balance:   99500n,
  tier:      2,
  isActive:  true,
  name:      'Alice',
}
```
