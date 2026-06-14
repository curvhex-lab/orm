# Adaptörlere Genel Bakış

Adaptör katmanı, Curvhex ORM'i taşınabilir kılan şeydir. Sorgular kararlı bir API'ye karşı yazılır; adaptör bunları nasıl karşılayacağına karar verir.

## Mevcut Adaptörler

### RpcAdapter (varsayılan)

Herhangi bir Solana RPC uç noktasıyla çalışır. Ek kurulum gerekmez.

[Tam belgeleme →](/tr/guide/rpc-adapter)

### HeliusAdapter *(yakında)*

Helius DAS API'sini kullanır. Sunucu taraflı aralık sorguları ve daha yüksek hız limitleri sağlar.

[Tam belgeleme →](/tr/guide/helius-adapter)

### PostgresAdapter *(yakında)*

Kendi Geyser ile indekslenmiş Postgres veritabanını sorgular. Gerçek sunucu taraflı sıralama, aralık sorguları, agregasyonlar ve JOIN'ler sağlar.

[Tam belgeleme →](/tr/guide/postgres-adapter)

## Yetenek Matrisi

| Yetenek | RpcAdapter | HeliusAdapter | PostgresAdapter |
|---------|-----------|---------------|-----------------|
| Eşitlik filtresi (zincir üstü `memcmp`) | ✅ | ✅ | ✅ |
| Aralık filtresi (`gt`, `gte`, …) | ⚠️ istemci | ✅ sunucu | ✅ sunucu |
| Sıralama | ⚠️ istemci | ✅ sunucu | ✅ sunucu |
| Agregasyon | ⚠️ istemci | kısmi | ✅ sunucu |
| İlişkiler (`include`) | ⚠️ N+1 | ⚠️ N+1 | ✅ JOIN |
| Kurulum | Yok | Helius API anahtarı | Geyser indeksleyici |

## Adaptör Seçme

- **Prototip / küçük program (<10k hesap):** `RpcAdapter` — sıfır kurulum, her yerde çalışır.
- **Üretim / büyük program:** `HeliusAdapter` — çok daha yüksek hız limitleri, minimal kurulum.
- **Analitik / karmaşık sorgular:** `PostgresAdapter` — tam SQL gücü.

## Adaptör Değiştirme

Adaptörü değiştirmek hiçbir sorgu kodunu değiştirmeyi gerektirmez:

```typescript
// Önce (prototip)
const orm = new CurvhexORM({ connection, programId, models })

// Sonra (üretim)
const orm = new CurvhexORM({
  connection, programId, models,
  adapter: new HeliusAdapter({ apiKey }),
})

// Aynı sorgu — değişiklik yok
const users = await orm.models.userAccount.findMany({
  where: { balance: { gt: 1000n } },
})
```
