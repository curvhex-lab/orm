# PostgresAdapter

::: warning Yakında
`PostgresAdapter` yol haritasındadır ve henüz yayınlanmamıştır.
:::

`PostgresAdapter`, kendi Geyser ile indekslenmiş Postgres veritabanını sorgular. Tüm istemci taraflı yükü ortadan kaldırarak gerçek sunucu taraflı aralık sorguları, sıralama, agregasyonlar ve SQL JOIN'leri etkinleştirir.

## Planlanan Kullanım

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { PostgresAdapter } from '@curvhex/orm/adapters'

const orm = new CurvhexORM({
  connection,
  programId: 'PROGRAM_ID',
  models:    { UserAccount },
  adapter:   new PostgresAdapter({
    connectionString: 'postgresql://kullanici:sifre@localhost:5432/veritabanim',
    table:            'user_accounts',
  }),
})
```

## Ne Zaman Kullanılır

- Veritabanı düzeyinde gerçek agregasyonlar
- Binlerce hesabı indirmeden karmaşık sıralama
- JOIN olarak ilişkiler — N+1 yok
- Geyser event geçmişi üzerinden geçmiş sorgular

## Katkı

Bunu inşa etmeye yardım etmek ister misin? [Özel Adaptör rehberine](/tr/guide/custom-adapter) bak ve bir PR aç.
