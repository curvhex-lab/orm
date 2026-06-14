# count

Bir filtreyle eşleşen hesap sayısını döndürür.

## İmza

```typescript
count(where?: WhereClause<M>): Promise<number>
```

## Örnekler

```typescript
// Tüm hesapları say
const total = await orm.models.userAccount.count()

// Filtreyle say
const activeCount = await orm.models.userAccount.count({ isActive: true })

// Aralık filtresiyle say
const richCount = await orm.models.userAccount.count({
  balance: { gte: 10_000n },
})
```

## Notlar

`RpcAdapter` ile eşleşen tüm hesaplar sayılmadan önce çekilir. `PostgresAdapter` bunu `SELECT COUNT(*)` sorgusuna iter.
