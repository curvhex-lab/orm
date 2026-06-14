# Giriş

Curvhex ORM, Solana PDA hesapları için bir TypeScript sorgu kütüphanesidir. `getProgramAccounts` üzerinde [Prisma](https://www.prisma.io/)'ya benzer bir API sunar ve projen büyüdükçe veri kaynağını değiştirmeni sağlayan bir adaptör katmanı içerir.

## Sorun

Solana, program durumunu hesaplarda (PDA) saklar. Bunları sorgulamak zahmetlidir:

- `getProgramAccounts` yalnızca tam bayt eşleştirmeyi (`memcmp`) destekler
- RPC düzeyinde aralık sorgusu, sıralama, agregasyon veya ilişki yoktur
- Her proje aynı seri kaldırma + filtreleme şablonunu yeniden uygular
- Genel bir RPC'den indeksleyiciye (Helius, kendi Postgres'in) geçmek tüm sorgu mantığını yeniden yazmayı gerektirir

## Çözüm

Hesap şemanı bir kez tanımla. Sorguları bir kez yaz. ORM seri kaldırma, filtreleme ve veri kaynağı yönlendirmesini halleder.

```typescript
// Önce: manuel, kırılgan, tipsiz
const accounts = await connection.getProgramAccounts(programId, {
  filters: [
    { dataSize: 165 },
    { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },
  ],
})
const users = accounts.map(({ account }) => {
  const data = account.data
  const authority = new PublicKey(data.slice(8, 40)).toBase58()
  const balance = data.readBigUInt64LE(40)
  // ...
})

// Sonra: bildirimsel, tipli, taşınabilir
const users = await orm.models.userAccount.findMany({
  where:   { authority: wallet.publicKey, isActive: true },
  orderBy: { balance: 'desc' },
  take:    10,
})
```

## Nasıl Çalışır

```
Kodun  →  CurvhexORM  →  QueryAdapter  →  Veri Kaynağı
                           ├── RpcAdapter       (getProgramAccounts)
                           ├── HeliusAdapter    (DAS API)        [yakında]
                           └── PostgresAdapter  (kendi indeksleyicin) [yakında]
```

Adaptör deseni, sorgularının altyapından bağımsız olmasını sağlar. Prototip için ücretsiz `RpcAdapter` ile başla, üretim verimi için `HeliusAdapter`'a geç, gerçek sunucu taraflı aralık sorguları gerektiğinde `PostgresAdapter`'a taşı — tek bir sorgu değişikliği olmadan.

## Temel Özellikler

| Özellik | Durum |
|---------|-------|
| `findMany`, `findFirst`, `findByAddress`, `findByPda` | ✅ |
| Eşitlik filtreleri (zincir üstü `memcmp`) | ✅ |
| Aralık filtreleri (`gt`, `gte`, `lt`, `lte`, `between`, `in`) | ✅ |
| `count`, `aggregate`, `groupBy` | ✅ |
| `include` — ilişki yükleme | ✅ |
| Anchor discriminator yardımcısı | ✅ |
| `HeliusAdapter` | 🔜 |
| `PostgresAdapter` | 🔜 |
| WebSocket abonelikleri (`watch`) | 🔜 |

## Sonraki Adımlar

- [Hızlı Başlangıç](/tr/guide/quick-start) — 5 dakikada çalışır duruma gel
- [Şema Tanımı](/tr/guide/schema) — hesap modellerini tanımlama
- [Sorgulama](/tr/guide/querying) — tam sorgu API'si
