# Hızlı Başlangıç

Bu rehber seni sıfırdan 5 dakika içinde ilk sorguyu çalıştırmaya götürür.

## 1. Kur

```bash
npm install @curvhex/orm @solana/web3.js
```

## 2. Şemanı Tanımla

Zincir üstü Anchor hesabını yansıtan bir şema oluştur:

```typescript
import { defineModel, anchor } from '@curvhex/orm'

const UserAccount = defineModel({
  discriminator: anchor('UserAccount'), // 8 baytlık Anchor discriminator'ı

  fields: {
    authority: { type: 'publicKey' }, // 32 bayt
    balance:   { type: 'u64' },       // 8 bayt (bigint)
    tier:      { type: 'u8' },        // 1 bayt
    isActive:  { type: 'bool' },      // 1 bayt
    name:      { type: 'string' },    // 4 + N bayt (Borsh string)
  },
})
```

::: tip Otomatik Ofsetler
Alan bayt ofsetleri, discriminator uzunluğundan ve alan sırasından otomatik olarak hesaplanır — tıpkı Anchor'ın bellekte düzenlediği gibi. Manuel bayt sayımı yok.
:::

## 3. ORM'i Oluştur

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { Connection, PublicKey } from '@solana/web3.js'

const connection = new Connection('https://api.mainnet-beta.solana.com')

const orm = new CurvhexORM({
  connection,
  programId: new PublicKey('PROGRAM_ID'),
  models: { UserAccount },
})
```

## 4. İlk Sorguyu Çalıştır

```typescript
// Bakiyesi 1000'den fazla olan tüm aktif kullanıcıları bul, en yüksekten sırala
const users = await orm.models.userAccount.findMany({
  where: {
    isActive: true,
    balance:  { gt: 1000n },
  },
  orderBy: { balance: 'desc' },
  take:    10,
})

console.log(users)
// [
//   { address: 'Abc...', authority: 'Xyz...', balance: 99500n, tier: 2, isActive: true, name: 'Alice' },
//   ...
// ]
```

## 5. Daha Fazla Sorgu Kalıbı

```typescript
// PDA tohumlarıyla
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])

// Adrese göre
const user = await orm.models.userAccount.findByAddress('Abc123...')

// Say
const activeCount = await orm.models.userAccount.count({ isActive: true })

// Agrege et
const stats = await orm.models.userAccount.aggregate({
  where: { isActive: true },
  _sum:  { balance: true },
  _avg:  { balance: true },
})
```

## Sonraki Adımlar

- [Şema Tanımı](/tr/guide/schema) — tüm alan türleri ve seçenekler
- [Sorgulama](/tr/guide/querying) — tam sorgu API referansı
- [Filtreleme](/tr/guide/filtering) — zincir üstü ve istemci taraflı filtreler
- [Adaptörler](/tr/guide/adapters) — varsayılan RPC adaptörünün ötesine geçme
