# findMany

Verilen seçeneklerle eşleşen tüm hesapları dizi olarak döndürür.

## İmza

```typescript
findMany(options?: FindManyOptions<M>): Promise<(InferModel<M> & { address: string })[]>
```

## Seçenekler

| Seçenek | Tür | Açıklama |
|---------|-----|----------|
| `where` | `WhereClause<M>` | Filtre koşulları |
| `orderBy` | `{ [alan]: 'asc' \| 'desc' }` | Sonuçları sırala |
| `take` | `number` | Maksimum sonuç sayısı |
| `skip` | `number` | Atlanacak sonuç sayısı |
| `dataSize` | `number` | Tam hesap veri bayt boyutuna göre filtrele |
| `include` | `IncludeMap` | İlgili hesapları yükle |

## Örnekler

```typescript
// Temel
const users = await orm.models.userAccount.findMany()

// Filtrelerle
const activeUsers = await orm.models.userAccount.findMany({
  where: { isActive: true, tier: 2 },
})

// Aralık filtreleri
const richUsers = await orm.models.userAccount.findMany({
  where: {
    isActive: true,
    balance:  { gte: 10_000n },
    tier:     { in: [2, 3] },
  },
})

// Sıralama ve sayfalama
const page2 = await orm.models.userAccount.findMany({
  where:   { isActive: true },
  orderBy: { balance: 'desc' },
  take:    20,
  skip:    20,
})

// İlişkilerle
const vaults = await orm.models.vaultAccount.findMany({
  include: { owner: { model: UserAccount, foreignKey: 'ownerPubkey' } },
})
```

## Dönüş Değeri

Her biri `address` alanı içeren tipli hesap nesnelerinden oluşan dizi. Eşleşme yoksa boş dizi `[]` döner.

## Where Operatörleri

```typescript
where: {
  // Eşitlik (zincir üstü memcmp)
  authority: 'Abc123...', isActive: true, tier: 2,
  // Aralık (istemci taraflı)
  balance: { gt: 1000n }, balance: { between: [100n, 5000n] },
  tier:    { in: [1, 2] }, tier: { not: 0 },
}
```
