# Yol Haritası

## Yayınlananlar (v0.1.x)

- ✅ Otomatik ofset hesabı ile şema tanımı
- ✅ Borsh seri kaldırma — tüm ilkel türler
- ✅ `findMany` — `memcmp` zincir üstü filtreler + istemci taraflı aralık operatörleri
- ✅ `findFirst`, `findByAddress`, `findByPda`
- ✅ `count`, `aggregate`, `groupBy`
- ✅ `include` — adres tekilleştirmeli ilişki yükleme
- ✅ `anchor()` discriminator yardımcısı
- ✅ Adaptör deseni (`QueryAdapter` arayüzü)
- ✅ `RpcAdapter`

## Devam Edenler

- 🔜 `HeliusAdapter` — Helius DAS API entegrasyonu
- 🔜 `PostgresAdapter` — Geyser ile indekslenmiş Postgres + senkronizasyon rehberi

## Planlananlar

- ⬜ İmleç tabanlı sayfalama (`findMany`'de `cursor` seçeneği)
- ⬜ WebSocket abonelikleri (`watch()` — `onAccountChange`'i sarar)
- ⬜ Enum alan desteği
- ⬜ `Option<T>` alan desteği
- ⬜ `Vec<T>` alan desteği
- ⬜ CLI: `curvhex generate` — Anchor IDL'den şema üret
- ⬜ RPC 2.0 adaptörü (Triton)

## Katkı

Şu anda en yüksek değerli katkılar:

1. **`HeliusAdapter`** — `QueryAdapter` arayüzü belgelenmiş, Helius DAS API herkese açık
2. **`Vec<T>` alan desteği** — `FieldType` union ve seri kaldırıcıyı genişlet
3. **`Option<T>` alan desteği** — Borsh'un isteğe bağlı değerler için yazdığı 1 baytlık varlık önekini işle
4. **Enum alanlar** — `u8` değerlerini şema üzerinden string enum'a eşle

[GitHub](https://github.com/vertext-labs/orm)'da bir PR aç.
