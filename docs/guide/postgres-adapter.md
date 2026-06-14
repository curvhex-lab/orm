# PostgresAdapter

::: warning Coming Soon
`PostgresAdapter` is on the roadmap and not yet released. This page documents the planned API.
:::

The `PostgresAdapter` queries your own Geyser-indexed Postgres database. It enables true server-side range queries, sorting, aggregations, and SQL JOINs for relations — eliminating all client-side overhead.

## Planned Usage

```typescript
import { CurvhexORM } from '@curvhex/orm'
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

## When to Use This

Use `PostgresAdapter` when you need:

- **True aggregations** — `SUM`, `AVG`, `GROUP BY` at the database level
- **Complex sorting** — without downloading thousands of accounts
- **Relations as JOINs** — no N+1 fetches
- **Historical queries** — querying past state via Geyser event history

## Setting Up a Geyser Indexer

To use `PostgresAdapter` you need a Postgres database indexed by a Geyser plugin. Options:

- **[Yellowstone Geyser](https://github.com/rpcpool/yellowstone-grpc)** — open source, gRPC-based
- **[Helius Webhooks](https://docs.helius.dev/webhooks-and-websockets/what-are-webhooks)** — push account updates to your API, write to Postgres yourself
- **[Shyft](https://shyft.to)** — managed indexer service

A Geyser sync guide will be included in the release.

## Contributing

Want to help build this? See the [Custom Adapter guide](/guide/custom-adapter) and open a PR.
