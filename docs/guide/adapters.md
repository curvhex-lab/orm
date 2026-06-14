# Adapters Overview

The adapter layer is what makes Curvhex ORM portable. Your queries are written against a stable API; the adapter decides how to fulfill them.

## The Adapter Interface

Every adapter implements `QueryAdapter`:

```typescript
interface QueryAdapter {
  findMany<M extends ModelDefinition>(
    model:   M,
    options: FindManyOptions<M>,
  ): Promise<InferModel<M>[]>

  findByAddress<M extends ModelDefinition>(
    model:   M,
    address: string,
  ): Promise<InferModel<M> | null>

  findByPda<M extends ModelDefinition>(
    model:  M,
    seeds:  (Buffer | Uint8Array)[],
  ): Promise<InferModel<M> | null>
}
```

## Available Adapters

### RpcAdapter (default)

Works with any Solana RPC endpoint. No additional setup.

```typescript
const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  // adapter: new RpcAdapter(connection) — this is the default
})
```

[Full documentation →](/guide/rpc-adapter)

### HeliusAdapter *(coming soon)*

Uses the Helius DAS API. Enables server-side range queries and higher rate limits.

```typescript
import { HeliusAdapter } from '@curvhex/orm/adapters'

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new HeliusAdapter({ apiKey: 'your-helius-key' }),
})
```

[Full documentation →](/guide/helius-adapter)

### PostgresAdapter *(coming soon)*

Queries your own Geyser-indexed Postgres database. Enables true server-side sorting, range queries, aggregations, and JOINs.

```typescript
import { PostgresAdapter } from '@curvhex/orm/adapters'

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

[Full documentation →](/guide/postgres-adapter)

## Capability Matrix

| Capability | RpcAdapter | HeliusAdapter | PostgresAdapter |
|------------|-----------|---------------|-----------------|
| Equality filter (on-chain `memcmp`) | ✅ | ✅ | ✅ |
| Range filter (`gt`, `gte`, …) | ⚠️ client-side | ✅ server | ✅ server |
| Sorting | ⚠️ client-side | ✅ server | ✅ server |
| Aggregation | ⚠️ client-side | partial | ✅ server |
| Relations (`include`) | ⚠️ N+1 | ⚠️ N+1 | ✅ JOIN |
| Setup required | None | Helius API key | Geyser indexer |

## Choosing an Adapter

- **Prototype / small program (<10k accounts):** `RpcAdapter` — zero setup, works anywhere.
- **Production / large program:** `HeliusAdapter` — much higher rate limits, server-side filtering, minimal setup.
- **Analytics / complex queries:** `PostgresAdapter` — full SQL power, true aggregations and JOINs.

## Swapping Adapters

Changing your adapter never requires touching query code:

```typescript
// Before (prototype)
const orm = new CurvhexORM({ connection, programId, models })

// After (production)
const orm = new CurvhexORM({
  connection, programId, models,
  adapter: new HeliusAdapter({ apiKey }),
})

// Same query — no changes needed
const users = await orm.models.userAccount.findMany({
  where: { balance: { gt: 1000n } },
})
```
