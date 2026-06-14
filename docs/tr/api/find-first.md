# findFirst

İlk eşleşen hesabı döndürür, yoksa `null`.

## İmza

```typescript
findFirst(options?: FindManyOptions<M>): Promise<(InferModel<M> & { address: string }) | null>
```

[`findMany`](/tr/api/find-many) ile aynı seçenekleri kabul eder.

## Örnek

```typescript
const user = await orm.models.userAccount.findFirst({
  where:   { authority: wallet.publicKey.toBase58() },
  orderBy: { balance: 'desc' },
})

if (user) {
  console.log(user.balance) // bigint
} else {
  console.log('bulunamadı')
}
```

## Notlar

- Dahili olarak aynı seçeneklerle `findMany` çağırır ve ilk elemanı döndürür.
- Birden fazla hesap eşleşebilecekse deterministik sonuç için `orderBy` kullan.
