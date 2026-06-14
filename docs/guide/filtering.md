# Filtering

Curvhex ORM supports two categories of filters: **on-chain** (sent as `memcmp` to the RPC) and **client-side** (applied after fetching).

## On-Chain vs Client-Side

| Filter | RpcAdapter | HeliusAdapter | PostgresAdapter |
|--------|-----------|---------------|-----------------|
| Equality (`field: value`) | ✅ `memcmp` | ✅ | ✅ |
| Range (`gt`, `gte`, `lt`, `lte`) | ⚠️ client-side | ✅ | ✅ |
| Set (`in`, `not`) | ⚠️ client-side | ✅ | ✅ |
| `between` | ⚠️ client-side | ✅ | ✅ |

**On-chain filters** (equality) are sent to the RPC as `memcmp` constraints — only matching accounts are transferred over the wire. This is fast and efficient.

**Client-side filters** require fetching all accounts that pass on-chain filters first, then filtering in memory. Combine on-chain equality filters with client-side range filters for best performance.

```typescript
// Fast: 'authority' is sent as memcmp, then balance is filtered client-side
const users = await orm.models.userAccount.findMany({
  where: {
    authority: wallet.publicKey.toBase58(), // on-chain memcmp ✅
    balance:   { gt: 1000n },              // client-side ⚠️
  },
})
```

## Equality Filters

Pass a value directly to filter for an exact match. Supported for all primitive field types.

```typescript
where: {
  isActive:  true,
  tier:      2,
  authority: 'Abc123...',
}
```

## Range Operators

Available for numeric fields (`u8`–`u128`, `i8`–`i128`) and `bigint` fields.

```typescript
where: {
  balance: { gt:  1000n },
  balance: { gte: 1000n },
  balance: { lt:  50000n },
  balance: { lte: 50000n },
  tier:    { gt: 0 },
}
```

## `between`

Shorthand for `gte` + `lte`.

```typescript
where: {
  balance: { between: [1000n, 50000n] },
  tier:    { between: [1, 3] },
}
```

## `in`

Matches any value in a set.

```typescript
where: {
  tier: { in: [1, 2, 3] },
}
```

## `not`

Excludes a specific value.

```typescript
where: {
  tier: { not: 0 },
}
```

## `dataSize`

Filter by the byte size of the account data. Useful when a program stores multiple account types with overlapping discriminators.

```typescript
const users = await orm.models.userAccount.findMany({
  dataSize: 165,
})
```

## Combining Filters

All filters in `where` are combined with AND logic:

```typescript
where: {
  authority: wallet.publicKey.toBase58(), // AND
  isActive:  true,                        // AND
  balance:   { gte: 1000n, lte: 100000n }, // AND (range is also ANDed internally)
  tier:      { in: [1, 2] },
}
```

## Performance Tips

1. **Put equality filters first in your mental model** — they're free (on-chain). Range filters cost a network round-trip for all matching accounts.
2. **Use `dataSize`** when your program has multiple account types with the same discriminator prefix.
3. **Use `take`** to cap results when you only need a subset — sorting + slicing happens client-side, so you still fetch everything that passes the on-chain filter.
4. **For production at scale**, switch to `HeliusAdapter` or `PostgresAdapter` where range queries run server-side.
