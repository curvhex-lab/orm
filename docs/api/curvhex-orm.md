# CurvhexORM

The entry point class. Wires your model definitions to a query adapter and exposes per-model clients via `orm.models`.

## Constructor

```typescript
new CurvhexORM(options: CurvhexORMOptions)
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `connection` | `Connection` | ✅ | Solana `Connection` from `@solana/web3.js` |
| `programId` | `string \| PublicKey` | ✅ | Your program's public key |
| `models` | `Record<string, ModelDefinition>` | ✅ | Schema definitions |
| `adapter` | `QueryAdapter` | — | Defaults to `RpcAdapter(connection)` |

## Example

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { Connection, PublicKey } from '@solana/web3.js'

const orm = new CurvhexORM({
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  programId:  new PublicKey('YOUR_PROGRAM_ID'),
  models: {
    UserAccount,
    VaultAccount,
  },
})
```

## `orm.models`

A record of model clients, keyed by camelCase model name. Each client exposes the full query API.

```typescript
orm.models.userAccount   // CurvhexClient<typeof UserAccount>
orm.models.vaultAccount  // CurvhexClient<typeof VaultAccount>
```

Model names are derived from the key passed in `models`:

```typescript
models: {
  UserAccount: UserAccountDef,  // → orm.models.userAccount (camelCase)
}
```

## With a Custom Adapter

```typescript
import { HeliusAdapter } from '@curvhex/orm/adapters'

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new HeliusAdapter({ apiKey: 'YOUR_KEY' }),
})
```
