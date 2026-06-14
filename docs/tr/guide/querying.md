# Sorgulama

Şemanı tanımlayıp ORM'i oluşturduktan sonra her model üzerinde zengin bir sorgu metodu setine sahip olursun.

## `findMany`

Eşleşen tüm hesapları dizi olarak döndürür.

```typescript
const users = await orm.models.userAccount.findMany({
  where:    { isActive: true },
  orderBy:  { balance: 'desc' },
  take:     20,
  skip:     0,
  dataSize: 165,
})
```

**Seçenekler:**

| Seçenek | Tür | Açıklama |
|---------|-----|----------|
| `where` | `WhereClause` | Filtre koşulları |
| `orderBy` | `{ alan: 'asc' \| 'desc' }` | Sonuçları sırala (istemci taraflı) |
| `take` | `number` | Maksimum sonuç sayısı |
| `skip` | `number` | Sayfalama için atlanacak sonuç sayısı |
| `dataSize` | `number` | Tam hesap veri bayt boyutuna göre filtrele |
| `include` | `IncludeMap` | İlgili hesapları yükle |

## `findFirst`

İlk eşleşen hesabı döndürür, yoksa `null`.

```typescript
const user = await orm.models.userAccount.findFirst({
  where:   { authority: wallet.publicKey.toBase58() },
  orderBy: { balance: 'desc' },
})
// → UserAccount | null
```

## `findByAddress`

Tek bir hesabı public key string'iyle çeker. Her zaman doğrudan RPC'ye gider.

```typescript
const user = await orm.models.userAccount.findByAddress('Abc123...')
// → UserAccount | null
```

::: tip Tutarlılık
Bir işlem göndermeden önce en güncel zincir üstü duruma ihtiyacın varsa `findByAddress` veya `findByPda` kullan. Off-chain adaptörler 1–2 slot geride kalabilir.
:::

## `findByPda`

PDA'yı tohumlardan türetir ve hesabı çeker.

```typescript
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])
// → UserAccount | null
```

## `count`

Bir filtreyle eşleşen hesap sayısını döndürür.

```typescript
const total = await orm.models.userAccount.count({ isActive: true })
// → 142
```

## `aggregate`

Bir hesap kümesi üzerinde istatistik hesaplar.

```typescript
const stats = await orm.models.userAccount.aggregate({
  where: { isActive: true },
  _count: true,
  _sum:   { balance: true },
  _avg:   { balance: true },
  _min:   { balance: true },
  _max:   { balance: true },
})
// → { _count: 142, _sum: { balance: 5_000_000n }, ... }
```

## `groupBy`

Hesapları bir veya daha fazla alana göre gruplar ve grup başına agregasyon çalıştırır.

```typescript
const byTier = await orm.models.userAccount.groupBy({
  by:    ['tier'],
  where: { isActive: true },
  _count: true,
  _sum:  { balance: true },
})
// → [
//     { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
//     { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
//   ]
```

## Sonuç Şekli

Her sonuç, seri kaldırılan alanların yanı sıra hesabın `address`'ini (base58 string olarak public key) içerir:

```typescript
{
  address:   'Abc123...',
  authority: 'Xyz456...',
  balance:   99500n,
  tier:      2,
  isActive:  true,
  name:      'Alice',
}
```
