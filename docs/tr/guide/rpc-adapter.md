# RpcAdapter

Varsayılan adaptör. Arka planda `getProgramAccounts` kullanır — ek kurulum veya API anahtarı gerekmez.

## Kullanım

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { Connection } from '@solana/web3.js'

const orm = new CurvhexORM({
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  programId:  'PROGRAM_ID',
  models:     { UserAccount },
  // RpcAdapter varsayılandır — adaptör seçeneği gerekmez
})
```

## Nasıl Çalışır

**Eşitlik filtreleri → `memcmp`:** `where` içindeki eşitlik filtreleri `memcmp` kısıtlamalarına dönüştürülür — yalnızca eşleşen hesaplar aktarılır.

**Aralık filtreleri → istemci taraflı:** `gt`, `gte`, `lt`, `lte`, `between`, `in`, `not` hesaplar çekildikten sonra bellekte uygulanır.

**Sıralama ve sayfalama:** `orderBy`, `take`, `skip` çekildikten sonra istemci tarafında uygulanır.

## Sınırlamalar

- **`getProgramAccounts` birçok genel RPC uç noktasında devre dışı veya hız sınırlıdır.** Özel bir RPC uç noktası kullan veya `HeliusAdapter`'a geç.
- **Aralık sorguları tüm eşleşen hesapların indirilmesini gerektirir.** Büyük veri setleri için `HeliusAdapter` veya `PostgresAdapter` kullan.

## Önerilen RPC Uç Noktaları

| Sağlayıcı | Notlar |
|-----------|--------|
| [Helius](https://helius.dev) | Yüksek hız limitleri, `getProgramAccounts` etkin |
| [QuickNode](https://quicknode.com) | Güvenilir, hızlı |
| [Triton](https://triton.one) | Kurumsal, RPC 2.0 desteği |
