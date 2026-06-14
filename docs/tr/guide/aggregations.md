# Agregasyonlar

Curvhex ORM, zincir üstü hesaplar üzerinde istatistik hesaplamak için `count`, `aggregate` ve `groupBy` sağlar.

## `count`

Bir filtreyle eşleşen hesap sayısını döndürür.

```typescript
const activeUsers = await orm.models.userAccount.count({ isActive: true })
// → 142

const allUsers = await orm.models.userAccount.count()
// → 200
```

## `aggregate`

Filtrelenmiş bir hesap kümesi üzerinde sayısal istatistikler hesaplar.

```typescript
const stats = await orm.models.userAccount.aggregate({
  where: { isActive: true },
  _count: true,
  _sum:   { balance: true },
  _avg:   { balance: true },
  _min:   { balance: true },
  _max:   { balance: true },
})
// → {
//     _count: 142,
//     _sum:   { balance: 5_000_000n },
//     _avg:   { balance: 35_211n },
//     _min:   { balance: 100n },
//     _max:   { balance: 500_000n },
//   }
```

## `groupBy`

Hesapları bir veya daha fazla alana göre gruplar ve grup başına agregasyon çalıştırır.

```typescript
const byTier = await orm.models.userAccount.groupBy({
  by:     ['tier'],
  where:  { isActive: true },
  _count: true,
  _sum:   { balance: true },
})
// → [
//     { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
//     { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
//   ]
```

### Birden Fazla Gruplama Anahtarı

```typescript
const breakdown = await orm.models.userAccount.groupBy({
  by:     ['tier', 'isActive'],
  _count: true,
  _avg:   { balance: true },
})
```

## Performans

`RpcAdapter` ile tüm agregasyonlar **istemci taraflı** çalışır. Büyük programlar için `HeliusAdapter` ve `PostgresAdapter` *(yakında)* agregasyonları sunucu tarafında çalıştırır.
