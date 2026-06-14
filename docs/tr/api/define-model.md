# defineModel

Hesap şemasını tanımlar. Sorgu API'si genelinde kullanılan tipli bir `ModelDefinition` döndürür.

## İmza

```typescript
function defineModel(input: {
  discriminator: number[]
  fields: Record<string, { type: FieldType }>
}): ModelDefinition
```

## Parametreler

### `discriminator`

`number[]` — Bu hesap türünü tanımlayan bayt öneki. Anchor programları için `anchor('HesapAdı')` kullan, native programlar için ham baytlar ilet.

### `fields`

Alan adı → `{ type: FieldType }` sıralı eşlemesi. **Sıra önemlidir** — alanlar zincir üstü programdaki serileştirme sırasıyla eşleşmelidir.

## Örnek

```typescript
import { defineModel, anchor } from '@curvhex/orm'

const UserAccount = defineModel({
  discriminator: anchor('UserAccount'),
  fields: {
    authority: { type: 'publicKey' },
    balance:   { type: 'u64' },
    tier:      { type: 'u8' },
    isActive:  { type: 'bool' },
    name:      { type: 'string' },
  },
})
```

## `anchor(ad)`

Verilen hesap adı için 8 baytlık Anchor hesap discriminator'ını hesaplar. Algoritma `sha256("account:<ad>")[0..8]`'dir — Anchor'ın kullandığı hash ile aynıdır.

```typescript
import { anchor } from '@curvhex/orm'

anchor('UserAccount') // → [149, 88, 201, 24, 166, 41, 99, 218]
```

## Tip Çıkarımı

```typescript
import type { InferModel } from '@curvhex/orm'

type User = InferModel<typeof UserAccount>
// {
//   address:   string
//   authority: string   ← publicKey → string (base58)
//   balance:   bigint   ← u64 → bigint
//   tier:      number   ← u8 → number
//   isActive:  boolean  ← bool → boolean
//   name:      string
// }
```
