# findByAddress

Tek bir hesabı public key'iyle çeker. Her zaman doğrudan RPC'ye gider — indeksleyici gecikmesini atlar.

## İmza

```typescript
findByAddress(address: string): Promise<(InferModel<M> & { address: string }) | null>
```

## Örnek

```typescript
const user = await orm.models.userAccount.findByAddress('Abc123...')

if (user) {
  console.log(user.balance) // bigint
}
```

## Notlar

- Hesap mevcut değilse `null` döner.
- İşlem göndermeden önce en güncel zincir üstü duruma ihtiyaç duyduğunda kullan.
