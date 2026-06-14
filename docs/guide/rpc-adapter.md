# RpcAdapter

The default adapter. Uses `getProgramAccounts` under the hood — no additional setup or API keys required.

## Usage

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { Connection } from '@solana/web3.js'

const orm = new CurvhexORM({
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  programId:  'YOUR_PROGRAM_ID',
  models:     { UserAccount },
  // RpcAdapter is the default — no adapter option needed
})
```

If you want to be explicit:

```typescript
import { CurvhexORM, RpcAdapter } from '@curvhex/orm'

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new RpcAdapter(connection),
})
```

## How It Works

### Equality filters → `memcmp`

When you pass equality filters in `where`, the adapter converts them to `memcmp` constraints:

```typescript
findMany({ where: { authority: 'Abc123...', isActive: true } })
// → getProgramAccounts(programId, {
//     filters: [
//       { memcmp: { offset: 8,  bytes: 'Abc123...' } },
//       { memcmp: { offset: 49, bytes: base58(Buffer.from([1])) } },
//     ]
//   })
```

Only accounts matching all constraints are transferred from the RPC node.

### Range filters → client-side

Range operators (`gt`, `gte`, `lt`, `lte`, `between`, `in`, `not`) are applied in memory after accounts are fetched:

```typescript
findMany({ where: { isActive: true, balance: { gt: 1000n } } })
// 1. getProgramAccounts with isActive memcmp → N accounts returned
// 2. client filters: account.balance > 1000n
```

### Sorting and pagination

`orderBy`, `take`, and `skip` are also applied client-side after fetching.

## Limitations

- **`getProgramAccounts` is disabled or rate-limited on many public RPC endpoints** for large programs. Use a private RPC endpoint (Helius, QuickNode, Triton) or switch to `HeliusAdapter`.
- **Range queries require downloading all matching accounts.** For a program with 1 million accounts where you need `balance > 1000`, all 1M accounts are transferred before filtering. Use `HeliusAdapter` or `PostgresAdapter` for large datasets.
- **No server-side sorting or aggregation.** Results are sorted and aggregated in your Node.js process.

## Recommended RPC Endpoints

| Provider | Notes |
|----------|-------|
| [Helius](https://helius.dev) | High rate limits, `getProgramAccounts` enabled |
| [QuickNode](https://quicknode.com) | Reliable, fast, multiple regions |
| [Triton](https://triton.one) | Enterprise, supports RPC 2.0 |
| Public endpoints | `api.mainnet-beta.solana.com` — rate limited, `getProgramAccounts` often blocked for large programs |
