# Architecture

## Overview

```
Your Code
    │
    ▼
CurvhexORM            ← entry point; wires models to the adapter
    │
    ▼
CurvhexClient         ← per-model query engine (findMany, aggregate, include…)
    │
    ▼
QueryAdapter          ← abstract interface
    ├── RpcAdapter        ← getProgramAccounts + in-memory filter/sort
    ├── HeliusAdapter     ← Helius DAS API             [coming soon]
    └── PostgresAdapter   ← pg / postgres client       [coming soon]
```

## Source Structure

```
src/
├── core/
│   ├── types.ts          — FieldType, ModelDefinition, InferModel
│   ├── schema.ts         — defineModel(), anchor(), offset calculation
│   ├── deserializer.ts   — Buffer → TypeScript object (Borsh)
│   └── filters.ts        — memcmp builder + client-side filter logic
│
├── adapters/
│   ├── abstract/
│   │   └── QueryAdapter.ts   — adapter interface
│   └── RpcAdapter.ts         — getProgramAccounts implementation
│
└── client/
    ├── CurvhexClient.ts   — findMany, findFirst, aggregate, groupBy, include
    └── CurvhexORM.ts      — entry point; wires models → adapter → client
```

## Key Design Decisions

### Why an adapter interface?

Solana's native RPC only supports `memcmp` — exact byte matching. Range queries, aggregation, and real sorting all need off-chain help.

Rather than picking one solution (Helius, Postgres, custom), the adapter interface keeps query code stable while the data source is pluggable. As the ecosystem matures (RPC 2.0, better indexers), adapters can be swapped without touching application code.

### Why client-side filtering in RpcAdapter?

`RpcAdapter` cannot push range queries to the RPC — it fetches all accounts that pass `memcmp` filters and applies range logic in memory. This is the correct tradeoff for the default adapter:

- Works on any RPC endpoint — no extra infrastructure
- Correct for small-to-medium programs (< ~50k accounts)
- Clearly documented as a limitation, not hidden

The `PostgresAdapter` will push range queries to SQL `WHERE` clauses, eliminating this cost.

### Automatic byte offsets

`defineModel` computes each field's byte offset at schema definition time, by walking the field list in order and accumulating sizes. This mirrors exactly how Anchor serializes accounts in memory — no IDL parsing, no manual byte math.

### `InferModel` — compile-time typing

The `InferModel<M>` utility type maps each field's `FieldType` to its TypeScript counterpart:

```typescript
type InferModel<M extends ModelDefinition> = {
  [K in keyof M['fields']]: FieldTypeToTS[M['fields'][K]['type']]
} & { address: string }
```

Every query method is generic over `M extends ModelDefinition` and returns `InferModel<M>[]`, so results are fully typed without any manual type annotation.

### Relation deduplication

`include` collects all foreign key values from the fetched accounts, deduplicates them with a `Set`, then issues one `getAccountInfo` call per unique address. Results are stored in a `Map<address, RelatedAccount>` and attached to each parent account. This keeps network calls proportional to the number of unique related accounts, not total accounts.
