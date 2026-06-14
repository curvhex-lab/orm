# İlişkiler

Curvhex ORM, `include` seçeneğini kullanarak tek bir sorgu çağrısında ilgili hesapları yükleyebilir. Çekmeleri otomatik olarak tekilleştirir — 100 vault aynı sahibi paylaşıyorsa o sahip hesabı yalnızca bir kez çekilir.

## Temel `include`

`foreignKey` ile ilgili modeli ve mevcut modeldeki diğer hesabın public key'ini tutan alanı belirterek bir ilişki tanımla.

```typescript
const VaultAccount = defineModel({
  discriminator: anchor('VaultAccount'),
  fields: {
    ownerPubkey: { type: 'publicKey' },
    totalLocked: { type: 'u64' },
    isActive:    { type: 'bool' },
  },
})

const vaults = await orm.models.vaultAccount.findMany({
  where:   { totalLocked: { gt: 1000n } },
  include: {
    owner: {
      model:      UserAccount,
      foreignKey: 'ownerPubkey',
    },
  },
})
```

**Sonuç şekli:**

```typescript
[
  {
    address:     'Vault1...',
    ownerPubkey: 'User1...',
    totalLocked: 5000n,
    isActive:    true,
    owner: {
      address:   'User1...',
      authority: 'Wallet1...',
      balance:   99500n,
      tier:      2,
    },
  },
]
```

Referans verilen hesap zincir üstünde mevcut değilse `owner` `null` olur.

## Çoklu İlişkiler

Aynı sorguda birden fazla ilişki ekle:

```typescript
const positions = await orm.models.position.findMany({
  where: { isOpen: true },
  include: {
    user:   { model: UserAccount,   foreignKey: 'userPubkey' },
    market: { model: MarketAccount, foreignKey: 'marketPubkey' },
  },
})
```

## Tekilleştirme

Birden fazla hesap aynı ilgili hesabı paylaşıyorsa yalnızca bir kez çekilir:

```typescript
// 500 vault, ama yalnızca 12 benzersiz sahip
// → 500 değil, 12 fetchAccount çağrısı
const vaults = await orm.models.vaultAccount.findMany({
  include: { owner: { model: UserAccount, foreignKey: 'ownerPubkey' } },
})
```

## Performans

`RpcAdapter` ve `HeliusAdapter` ile ilişkiler, benzersiz adres başına tekil `getAccountInfo` çağrısıyla çözülür. `PostgresAdapter` *(yakında)* ile ilişkiler SQL JOIN olarak çalışır.
