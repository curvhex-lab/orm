# Şema Tanımı

Şemalar, zincir üstü Anchor hesaplarının düzenini tanımlar. Curvhex ORM bunları iki amaçla kullanır: zincir üstü filtreleme için `memcmp` bayt ofsetlerini hesaplamak ve ham hesap verisini tipli TypeScript nesnelerine dönüştürmek.

## `defineModel`

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

### `discriminator`

Anchor'ın her hesabın başına türünü tanımlamak için yazdığı 8 baytlık önek.

**Anchor programları:** `anchor()` yardımcısını kullan — hesap adından discriminator'ı Anchor'ın kullandığı aynı hash ile hesaplar:

```typescript
import { anchor } from '@curvhex/orm'

anchor('UserAccount') // → [149, 88, 201, 24, 166, 41, 99, 218]
```

**Native programlar:** ham baytları doğrudan ver:

```typescript
discriminator: [1, 2, 3, 4, 5, 6, 7, 8]
```

**Discriminator yok:** boş dizi ilet:

```typescript
discriminator: []
```

### `fields`

Alan adlarından tanımlarına sıralı bir eşleme. **Sıra önemlidir** — alanlar Anchor'ın bunları serileştirdiği sırayla bildirilmelidir, çünkü ofsetler sıralı olarak hesaplanır.

## Alan Türleri

| Tür | Boyut | TypeScript | Notlar |
|-----|-------|------------|--------|
| `u8` | 1 bayt | `number` | |
| `u16` | 2 bayt | `number` | little-endian |
| `u32` | 4 bayt | `number` | little-endian |
| `u64` | 8 bayt | `bigint` | little-endian |
| `u128` | 16 bayt | `bigint` | little-endian |
| `i8` | 1 bayt | `number` | |
| `i16` | 2 bayt | `number` | little-endian |
| `i32` | 4 bayt | `number` | little-endian |
| `i64` | 8 bayt | `bigint` | little-endian |
| `i128` | 16 bayt | `bigint` | little-endian |
| `bool` | 1 bayt | `boolean` | |
| `publicKey` | 32 bayt | `string` | base58 kodlu |
| `string` | 4 + N bayt | `string` | Borsh: u32 uzunluk öneki + UTF-8 |
| `bytes` | 4 + N bayt | `string` | Borsh: u32 uzunluk öneki + ham baytlar → hex |

::: warning Değişken Uzunluklu Alanlar
`string` ve `bytes` alanları değişken uzunluklara sahiptir. Bunları sabit boyutlu alanlardan önce yerleştirmek, sonraki alanlar için ofsetlerin statik olarak hesaplanamamasına yol açar. Önceki tüm alanlarda zincir üstü `memcmp` filtrelemesini etkinleştirmek için değişken uzunluklu alanları **en sona** koy.
:::

## Tip Çıkarımı

`defineModel` tamamen tiplenmiş bir model döndürür. Bir sonucun TypeScript tipini çıkarmak için `InferModel` kullan:

```typescript
import type { InferModel } from '@curvhex/orm'

type User = InferModel<typeof UserAccount>
// {
//   address:   string
//   authority: string
//   balance:   bigint
//   tier:      number
//   isActive:  boolean
//   name:      string
// }
```
