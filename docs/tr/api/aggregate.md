# aggregate

Filtrelenmiş bir hesap kümesi üzerinde istatistikler hesaplar.

## İmza

```typescript
aggregate(options: AggregateOptions<M>): Promise<AggregateResult<M>>
```

## Seçenekler

| Seçenek | Tür | Açıklama |
|---------|-----|----------|
| `where` | `WhereClause<M>` | Agrege edilecek hesapları filtrele |
| `_count` | `true` | Eşleşen hesapları say |
| `_sum` | `{ [alan]: true }` | Her alanın toplamı |
| `_avg` | `{ [alan]: true }` | Her alanın ortalaması |
| `_min` | `{ [alan]: true }` | Her alanın minimumu |
| `_max` | `{ [alan]: true }` | Her alanın maksimumu |

## Örnek

```typescript
const stats = await orm.models.userAccount.aggregate({
  where:  { isActive: true },
  _count: true,
  _sum:   { balance: true },
  _avg:   { balance: true },
  _min:   { balance: true },
  _max:   { balance: true },
})

console.log(stats._count)        // 142
console.log(stats._sum.balance)  // 5_000_000n
console.log(stats._avg.balance)  // 35_211n
```

## Notlar

- Yalnızca sayısal alanlar (`u8`–`u128`, `i8`–`i128`) `_sum`, `_avg`, `_min`, `_max` içinde geçerlidir.
- `bigint` alanlarında `_avg` tam sayı bölmesi kullanır.
