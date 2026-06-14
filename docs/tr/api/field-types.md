# Alan Türleri

Desteklenen tüm alan türleri, bayt boyutları, TypeScript gösterimleri ve seri kaldırma notları.

## Sayısal Türler

| Tür | Boyut | TypeScript | Kodlama |
|-----|-------|------------|---------|
| `u8` | 1 bayt | `number` | işaretsiz |
| `u16` | 2 bayt | `number` | işaretsiz, little-endian |
| `u32` | 4 bayt | `number` | işaretsiz, little-endian |
| `u64` | 8 bayt | `bigint` | işaretsiz, little-endian |
| `u128` | 16 bayt | `bigint` | işaretsiz, little-endian |
| `i8` | 1 bayt | `number` | işaretli |
| `i16` | 2 bayt | `number` | işaretli, little-endian |
| `i32` | 4 bayt | `number` | işaretli, little-endian |
| `i64` | 8 bayt | `bigint` | işaretli, little-endian |
| `i128` | 16 bayt | `bigint` | işaretli, little-endian |

::: tip bigint
`u64`, `u128`, `i64` ve `i128` alanları TypeScript'te `bigint` olarak yazılır. Değişmezler için `n` sonekini kullan: `1000n`, `{ gt: 500n }`.
:::

## Boolean

| Tür | Boyut | TypeScript |
|-----|-------|------------|
| `bool` | 1 bayt | `boolean` |

## Public Key

| Tür | Boyut | TypeScript |
|-----|-------|------------|
| `publicKey` | 32 bayt | `string` (base58) |

## Değişken Uzunluklu Türler

| Tür | Boyut | TypeScript | Kodlama |
|-----|-------|------------|---------|
| `string` | 4 + N bayt | `string` | Borsh: u32 uzunluk öneki + UTF-8 |
| `bytes` | 4 + N bayt | `string` | Borsh: u32 uzunluk öneki + ham baytlar → hex |

::: warning
`string` ve `bytes` alanlarını diğer alanların **en sonuna** koy — bu sayede önceki sabit boyutlu alanlarda `memcmp` filtrelemesi çalışmaya devam eder.
:::

## Planlanan Türler

| Tür | Notlar |
|-----|--------|
| `enum` | `u8` discriminant'ı string varyantlara eşle |
| `option<T>` | Borsh seçeneği — 1 baytlık varlık öneki |
| `vec<T>` | Borsh vektörü — u32 uzunluk öneki + N eleman |
