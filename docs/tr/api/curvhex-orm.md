# CurvhexORM

Giriş noktası sınıfı. Model tanımlarını sorgu adaptörüne bağlar ve `orm.models` üzerinden model başına istemciler sunar.

## Yapılandırıcı

```typescript
new CurvhexORM(options: CurvhexORMOptions)
```

### Seçenekler

| Seçenek | Tür | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `connection` | `Connection` | ✅ | `@solana/web3.js`'den Solana `Connection` |
| `programId` | `string \| PublicKey` | ✅ | Programının public key'i |
| `models` | `Record<string, ModelDefinition>` | ✅ | Şema tanımları |
| `adapter` | `QueryAdapter` | — | Varsayılan olarak `RpcAdapter(connection)` |

## Örnek

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { Connection, PublicKey } from '@solana/web3.js'

const orm = new CurvhexORM({
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  programId:  new PublicKey('PROGRAM_ID'),
  models: {
    UserAccount,
    VaultAccount,
  },
})
```

## `orm.models`

Camel case model adına göre anahtarlanmış model istemcilerinin kaydı:

```typescript
orm.models.userAccount   // CurvhexClient<typeof UserAccount>
orm.models.vaultAccount  // CurvhexClient<typeof VaultAccount>
```
