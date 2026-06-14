# groupBy

Hesapları bir veya daha fazla alana göre gruplar ve grup başına agregasyon çalıştırır.

## İmza

```typescript
groupBy(options: GroupByOptions<M>): Promise<GroupByResult<M>[]>
```

## Seçenekler

| Seçenek | Tür | Açıklama |
|---------|-----|----------|
| `by` | `(keyof M['fields'])[]` | Gruplama alanları |
| `where` | `WhereClause<M>` | Gruplamadan önce filtrele |
| `_count` | `true` | Grup başına say |
| `_sum` | `{ [alan]: true }` | Grup başına toplam |
| `_avg` | `{ [alan]: true }` | Grup başına ortalama |
| `_min` | `{ [alan]: true }` | Grup başına minimum |
| `_max` | `{ [alan]: true }` | Grup başına maksimum |

## Örnekler

```typescript
// Tek alan
const byTier = await orm.models.userAccount.groupBy({
  by:     ['tier'],
  _count: true,
  _sum:   { balance: true },
})
// → [
//     { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
//     { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
//   ]

// Birden fazla alan
const breakdown = await orm.models.userAccount.groupBy({
  by:     ['tier', 'isActive'],
  _count: true,
})
```
