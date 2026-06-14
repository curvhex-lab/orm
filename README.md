# Curvhex ORM

TypeScript ORM for Solana PDA accounts. Query, filter, and aggregate on-chain data with a familiar API — inspired by Prisma, built for Solana.

```typescript
const users = await orm.models.userAccount.findMany({
  where:   { authority: wallet.publicKey, isActive: true },
  orderBy: { balance: 'desc' },
  take:    10,
})
```

---

## The Problem

Solana stores program state in accounts (PDAs). Querying them is painful:

- `getProgramAccounts` only supports exact byte matching (`memcmp`)
- No range queries, sorting, aggregation, or relations at the RPC level
- Every project reimplements the same deserialization + filtering boilerplate
- Switching from a public RPC to an indexer (Helius, your own Postgres) requires rewriting query logic

Curvhex ORM solves this with a single, adapter-agnostic query API.

---

## How It Works

```
Your Code  →  CurvhexORM  →  QueryAdapter  →  Data Source
                                ├── RpcAdapter       (getProgramAccounts)
                                ├── HeliusAdapter    (DAS API)        [soon]
                                └── PostgresAdapter  (your indexer)   [soon]
```

Define your schema once. Write queries once. Swap the adapter as your needs grow — from a quick prototype on public RPC to a production indexer — without changing a single query.

---

## Installation

```bash
npm install curvhex-orm @solana/web3.js
```

---

## Quick Start

### 1. Define your schema

```typescript
import { defineModel, anchor } from 'curvhex-orm'

const UserAccount = defineModel({
  // Anchor programs: use anchor() helper
  discriminator: anchor('UserAccount'),

  // Native programs: provide raw bytes
  // discriminator: [1, 2, 3, 4, 5, 6, 7, 8],

  fields: {
    authority: { type: 'publicKey' },
    balance:   { type: 'u64' },
    tier:      { type: 'u8' },
    isActive:  { type: 'bool' },
    name:      { type: 'string' },
  }
})
```

Field offsets are calculated automatically from the discriminator length and field order — no manual byte counting.

### 2. Create the ORM

```typescript
import { CurvhexORM, RpcAdapter } from 'curvhex-orm'
import { Connection, PublicKey } from '@solana/web3.js'

const connection = new Connection('https://api.mainnet-beta.solana.com')

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models: { UserAccount },
})
```

### 3. Query

```typescript
// Find by PDA seeds
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])

// Find by address
const user = await orm.models.userAccount.findByAddress('Abc123...')

// Find many with filters
const users = await orm.models.userAccount.findMany({
  where:   { isActive: true, authority: wallet.publicKey.toBase58() },
  orderBy: { balance: 'desc' },
  take:    20,
  skip:    0,
})
```

---

## API Reference

### `defineModel(input)`

Defines an account schema. Offsets are computed automatically.

```typescript
const MyAccount = defineModel({
  discriminator: anchor('MyAccount'), // or raw number[]
  fields: {
    owner:   { type: 'publicKey' },
    amount:  { type: 'u64' },
    enabled: { type: 'bool' },
  }
})
```

**Supported field types:**

| Type | Size | TypeScript type |
|------|------|-----------------|
| `u8` `u16` `u32` | 1–4 bytes | `number` |
| `i8` `i16` `i32` | 1–4 bytes | `number` |
| `u64` `u128` | 8–16 bytes | `bigint` |
| `i64` `i128` | 8–16 bytes | `bigint` |
| `bool` | 1 byte | `boolean` |
| `publicKey` | 32 bytes | `string` (base58) |
| `string` | 4 + N bytes | `string` |
| `bytes` | 4 + N bytes | `string` (hex) |

### `anchor(name)`

Computes the 8-byte Anchor discriminator for an account name.

```typescript
import { anchor } from 'curvhex-orm'

anchor('UserAccount') // → [149, 88, 201, ...]
```

### `findMany(options?)`

```typescript
const results = await orm.models.userAccount.findMany({
  where: {
    // Equality (on-chain memcmp — fast)
    authority: 'Abc123...',
    isActive:  true,
    tier:      2,

    // Range operators (client-side filter)
    balance: { gte: 100n, lte: 10_000n },
    balance: { gt: 0n },
    tier:    { in: [1, 2, 3] },
    balance: { between: [100n, 1000n] },
    tier:    { not: 0 },
  },
  orderBy: { balance: 'desc' },
  take:    10,
  skip:    0,
  dataSize: 165, // optional: filter by account byte size
})
```

> **On-chain vs client-side:** Equality filters (`authority`, `isActive`, `tier`) are sent as `memcmp` filters to the RPC node — only matching accounts are transferred. Range operators (`gt`, `gte`, `lt`, `lte`, `between`, `in`) are applied after accounts are received. Combine both for best performance.

### `findFirst(options?)`

Returns the first matching account or `null`.

```typescript
const user = await orm.models.userAccount.findFirst({
  where: { authority: wallet.publicKey.toBase58() }
})
```

### `findByAddress(address)`

Fetches a single account by its public key string.

```typescript
const user = await orm.models.userAccount.findByAddress('Abc123...')
```

### `findByPda(seeds)`

Derives the PDA and fetches the account.

```typescript
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])
```

### `count(where?)`

```typescript
const total = await orm.models.userAccount.count({ isActive: true })
```

### `aggregate(options)`

```typescript
const stats = await orm.models.userAccount.aggregate({
  where:  { isActive: true },
  _count: true,
  _sum:   { balance: true },
  _avg:   { balance: true },
  _min:   { balance: true },
  _max:   { balance: true },
})
// → { _count: 142, _sum: { balance: 5_000_000n }, _avg: ..., _min: ..., _max: ... }
```

### `groupBy(options)`

```typescript
const byTier = await orm.models.userAccount.groupBy({
  by:    ['tier'],
  where: { isActive: true },
  _count: true,
  _sum:  { balance: true },
})
// → [
//     { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
//     { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
//   ]
```

### `findMany` with `include` (Relations)

Fetch related accounts in a single call. Deduplicates addresses automatically — if 100 vaults share the same owner, the owner account is fetched once.

```typescript
const VaultAccount = defineModel({
  discriminator: anchor('VaultAccount'),
  fields: {
    ownerPubkey: { type: 'publicKey' },
    totalLocked: { type: 'u64' },
  }
})

const vaults = await orm.models.vaultAccount.findMany({
  where: { totalLocked: { gt: 1000n } },
  include: {
    owner: {
      model:      UserAccount,
      foreignKey: 'ownerPubkey',
    }
  }
})
// → [{ address, totalLocked, owner: { authority, balance, tier } }]
```

---

## Adapters

The query API is adapter-agnostic. Swap the data source without changing your queries.

### RpcAdapter (default)

Works with any Solana RPC endpoint. No setup required.

```typescript
import { CurvhexORM, RpcAdapter } from 'curvhex-orm'

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  // adapter defaults to RpcAdapter
})
```

**Limitations:** `getProgramAccounts` is rate-limited or blocked on many public endpoints for large programs. Range queries require fetching all matching accounts first.

### HeliusAdapter *(coming soon)*

Uses the Helius DAS API. Faster, higher rate limits, better support for large programs.

```typescript
import { HeliusAdapter } from 'curvhex-orm/adapters'

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new HeliusAdapter({ apiKey: 'your-helius-key' }),
})
```

### PostgresAdapter *(coming soon)*

Query your own Geyser-indexed database. Enables true range queries, sorting, and aggregation at the database level.

```typescript
import { PostgresAdapter } from 'curvhex-orm/adapters'

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new PostgresAdapter({
    connectionString: 'postgresql://user:pass@localhost:5432/mydb',
    table:            'user_accounts',
  }),
})
```

---

## Architecture

### Why adapters?

Solana's native RPC (`getProgramAccounts`) only supports exact byte matching. Range queries, sorting, and aggregation require off-chain infrastructure.

Rather than picking one solution, Curvhex ORM abstracts the data source:

```
findMany({ where: { balance: { gt: 100n } } })
  │
  ├── RpcAdapter       → fetch all + client-side filter
  ├── HeliusAdapter    → Helius API query
  └── PostgresAdapter  → SELECT * WHERE balance > 100
```

As the Solana ecosystem matures (Triton's RPC 2.0, indexers), adapters can be upgraded independently.

### On-chain vs off-chain filtering

| Filter type | RpcAdapter | HeliusAdapter | PostgresAdapter |
|-------------|-----------|---------------|-----------------|
| Equality (`authority = X`) | ✅ on-chain memcmp | ✅ | ✅ |
| Range (`balance > 100`) | ⚠️ client-side | ✅ | ✅ |
| Sorting | ⚠️ client-side | ✅ | ✅ |
| Aggregation | ⚠️ client-side | partial | ✅ |
| Relations (`include`) | ⚠️ N+1 fetches | ⚠️ N+1 fetches | ✅ JOIN |

### Data consistency

When using off-chain adapters (Helius, Postgres), there is an inherent indexer lag of 1–2 slots (~400–800ms). For critical reads (balance checks before transactions), use `findByAddress` or `findByPda` which always hit the RPC directly.

---

## Roadmap

- [x] Schema definition with automatic offset calculation
- [x] Borsh deserialization (all primitive types)
- [x] `findMany` — memcmp filters + client-side range operators
- [x] `findFirst`, `findByAddress`, `findByPda`
- [x] `count`, `aggregate`, `groupBy`
- [x] `include` — relation loading with deduplication
- [x] Anchor discriminator helper (`anchor()`)
- [x] Adapter pattern (`QueryAdapter` interface)
- [x] `RpcAdapter`
- [ ] `HeliusAdapter`
- [ ] `PostgresAdapter` + Geyser sync guide
- [ ] Cursor-based pagination
- [ ] WebSocket subscriptions (`watch`)
- [ ] Enum field support
- [ ] Option<T> field support
- [ ] Vec<T> field support
- [ ] CLI: generate schema from IDL
- [ ] RPC 2.0 adapter (Triton)

---

## Contributing

Contributions are welcome. Here's how to get started:

### Setup

```bash
git clone https://github.com/your-username/curvhex-orm
cd curvhex-orm
npm install
```

### Project structure

```
src/
├── core/
│   ├── types.ts          — field types, ModelDefinition, InferModel
│   ├── schema.ts         — defineModel, anchor(), offset calculation
│   ├── deserializer.ts   — Buffer → TypeScript object
│   └── filters.ts        — memcmp builder, client-side filter logic
├── adapters/
│   ├── abstract/
│   │   └── QueryAdapter.ts   — adapter interface
│   └── RpcAdapter.ts         — getProgramAccounts implementation
├── client/
│   ├── CurvhexClient.ts   — findMany, findFirst, aggregate, groupBy, include
│   └── CurvhexORM.ts      — entry point, wires models to adapter
└── __tests__/
    └── integration.test.ts
```

### Where to contribute

Good first issues:

- **`HeliusAdapter`** — implement `QueryAdapter` using the Helius DAS API
- **`PostgresAdapter`** — implement `QueryAdapter` using `pg` or `postgres` client
- **`Vec<T>` field support** — extend `FieldType` and the deserializer
- **`Option<T>` field support** — handle Borsh option prefix byte
- **Enum fields** — map `u8` values to string variants via schema
- **Cursor-based pagination** — add `cursor` to `FindManyOptions`
- **`watch()`** — WebSocket subscription wrapping `onAccountChange`

### Implementing a new adapter

Create a file under `src/adapters/` and implement the `QueryAdapter` interface:

```typescript
import { QueryAdapter, FindManyOptions } from './abstract/QueryAdapter'
import { ModelDefinition, InferModel } from '../core/types'

export class MyAdapter implements QueryAdapter {
  async findMany<M extends ModelDefinition>(
    model: M,
    options: FindManyOptions<M>
  ): Promise<InferModel<M>[]> {
    // your implementation
  }

  async findByAddress<M extends ModelDefinition>(
    model: M,
    address: string
  ): Promise<InferModel<M> | null> {
    // your implementation
  }

  async findByPda<M extends ModelDefinition>(
    model: M,
    seeds: (Buffer | Uint8Array)[]
  ): Promise<InferModel<M> | null> {
    // your implementation
  }
}
```

Then export it from `src/index.ts` and add a test case to `integration.test.ts`.

### Before submitting a PR

```bash
npx tsc --noEmit                          # type check
npx tsx src/__tests__/integration.test.ts # run tests
```

All 8 integration test cases must pass. If you're adding a new adapter, add at least `findByAddress` and `findMany` test cases using a mock or a real endpoint.

### Commit style

```
feat: add HeliusAdapter
fix: handle empty discriminator in buildFilters
docs: add Vec<T> field type to README
```

---

## License

Apache 2.0 with Commons Clause.

Free to use in your own projects. You may not sell this software or offer it as a hosted service without a commercial license.

