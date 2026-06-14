# HeliusAdapter

::: warning Yakında
`HeliusAdapter` yol haritasındadır ve henüz yayınlanmamıştır.
:::

`HeliusAdapter`, sunucu taraflı filtreleme, sıralama ve daha yüksek hız limitlerini kendi indeksleyici altyapısı gerektirmeden etkinleştirmek için [Helius DAS API](https://docs.helius.dev)'sini kullanır.

## Planlanan Kullanım

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { HeliusAdapter } from '@curvhex/orm/adapters'

const orm = new CurvhexORM({
  connection,
  programId: 'PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new HeliusAdapter({ apiKey: 'HELIUS_API_ANAHTARIN' }),
})
```

## Katkı

Bunu inşa etmeye yardım etmek ister misin? [Özel Adaptör rehberine](/tr/guide/custom-adapter) bak ve bir PR aç.
