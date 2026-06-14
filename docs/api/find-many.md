# findMany

Returns all accounts matching the given options.

## Signature

```typescript
findMany(options?: FindManyOptions<M>): Promise<(InferModel<M> & { address: string })[]>
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `where` | `WhereClause<M>` | Filter conditions |
| `orderBy` | `{ [field]: 'asc' \| 'desc' }` | Sort results (client-side with RpcAdapter) |
| `take` | `number` | Maximum number of results |
| `skip` | `number` | Number of results to skip (for pagination) |
| `dataSize` | `number` | Filter by exact account data byte size |
| `include` | `IncludeMap` | Load related accounts |

## Examples

### Basic query

```typescript
const users = await orm.models.userAccount.findMany()
```

### With filters

```typescript
const activeUsers = await orm.models.userAccount.findMany({
  where: { isActive: true, tier: 2 },
})
```

### With range filters

```typescript
const richUsers = await orm.models.userAccount.findMany({
  where: {
    isActive: true,
    balance:  { gte: 10_000n },
    tier:     { in: [2, 3] },
  },
})
```

### With sorting and pagination

```typescript
const page2 = await orm.models.userAccount.findMany({
  where:   { isActive: true },
  orderBy: { balance: 'desc' },
  take:    20,
  skip:    20,
})
```

### With relations

```typescript
const vaults = await orm.models.vaultAccount.findMany({
  where:   { totalLocked: { gt: 0n } },
  include: {
    owner: { model: UserAccount, foreignKey: 'ownerPubkey' },
  },
})
```

## Return Value

An array of typed account objects, each including an `address` field (the account's public key as a base58 string):

```typescript
[
  {
    address:   'Abc123...',
    authority: 'Xyz456...',
    balance:   99500n,
    tier:      2,
    isActive:  true,
    name:      'Alice',
  },
  // ...
]
```

Returns an empty array `[]` if no accounts match.

## Where Clause

See [Filtering](/guide/filtering) for the full list of supported operators.

```typescript
where: {
  // Equality (on-chain memcmp)
  authority: 'Abc123...',
  isActive:  true,
  tier:      2,

  // Range (client-side with RpcAdapter)
  balance: { gt:      1000n },
  balance: { gte:     1000n },
  balance: { lt:      50000n },
  balance: { lte:     50000n },
  balance: { between: [1000n, 50000n] },
  tier:    { in:      [1, 2, 3] },
  tier:    { not:     0 },
}
```
