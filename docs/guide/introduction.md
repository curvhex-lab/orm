# Introduction

Curvhex ORM is a TypeScript query library for Solana PDA accounts. It gives you a [Prisma](https://www.prisma.io/)-style API on top of `getProgramAccounts` — with an adapter layer that lets you swap data sources as your project grows.

## The Problem

Solana stores program state in accounts (PDAs). Querying them is painful:

- `getProgramAccounts` only supports exact byte matching (`memcmp`)
- No range queries, sorting, aggregation, or relations at the RPC level
- Every project reimplements the same deserialization + filtering boilerplate
- Switching from a public RPC to an indexer requires rewriting all query logic

## The Solution

Define your account schema once. Write queries once. The ORM handles deserialization, filtering, and data source routing.

```typescript
// Before: manual, brittle, untyped
const accounts = await connection.getProgramAccounts(programId, {
  filters: [
    { dataSize: 165 },
    { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },
  ],
})
const users = accounts.map(({ account }) => {
  const data = account.data
  const authority = new PublicKey(data.slice(8, 40)).toBase58()
  const balance = data.readBigUInt64LE(40)
  // ...
})

// After: declarative, typed, portable
const users = await orm.models.userAccount.findMany({
  where:   { authority: wallet.publicKey, isActive: true },
  orderBy: { balance: 'desc' },
  take:    10,
})
```

## How It Works

```
Your Code  →  CurvhexORM  →  QueryAdapter  →  Data Source
                               ├── RpcAdapter       (getProgramAccounts)
                               ├── HeliusAdapter    (DAS API)        [soon]
                               └── PostgresAdapter  (your indexer)   [soon]
```

The adapter pattern means your queries are independent of your infrastructure. Start with the free `RpcAdapter` for prototyping, graduate to `HeliusAdapter` for production throughput, and eventually to `PostgresAdapter` when you need true server-side range queries.

## Key Features

| Feature | Status |
|---------|--------|
| `findMany`, `findFirst`, `findByAddress`, `findByPda` | ✅ |
| Equality filters (on-chain `memcmp`) | ✅ |
| Range filters (`gt`, `gte`, `lt`, `lte`, `between`, `in`) | ✅ |
| `count`, `aggregate`, `groupBy` | ✅ |
| `include` — relation loading | ✅ |
| Anchor discriminator helper | ✅ |
| `HeliusAdapter` | 🔜 |
| `PostgresAdapter` | 🔜 |
| WebSocket subscriptions (`watch`) | 🔜 |

## Next Steps

- [Quick Start](/guide/quick-start) — up and running in 5 minutes
- [Schema Definition](/guide/schema) — defining account models
- [Querying](/guide/querying) — the full query API
