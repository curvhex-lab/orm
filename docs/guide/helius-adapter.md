# HeliusAdapter

::: warning Coming Soon
`HeliusAdapter` is on the roadmap and not yet released. This page documents the planned API.
:::

The `HeliusAdapter` uses the [Helius DAS API](https://docs.helius.dev) to enable server-side filtering, sorting, and higher rate limits — without requiring your own indexer infrastructure.

## Planned Usage

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { HeliusAdapter } from '@curvhex/orm/adapters'
import { Connection } from '@solana/web3.js'

const orm = new CurvhexORM({
  connection: new Connection('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'),
  programId:  'YOUR_PROGRAM_ID',
  models:     { UserAccount },
  adapter:    new HeliusAdapter({ apiKey: 'YOUR_HELIUS_API_KEY' }),
})
```

## Advantages Over RpcAdapter

| Capability | RpcAdapter | HeliusAdapter |
|------------|-----------|---------------|
| Range queries | client-side | server-side |
| Rate limits | strict | high |
| Large program support | limited | ✅ |
| `getProgramAccounts` | restricted on public RPC | ✅ via Helius |

## Contributing

Want to help build this? See the [Custom Adapter guide](/guide/custom-adapter) and open a PR.
