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

### İndeksleme Adaptörleri (Solana indeksleme ekosisteminden)

Standart `getProgramAccounts`'ın production'da yetersiz kaldığı senaryolar için (rate limit, kalıcılık yok, polling maliyeti):

- ⬜ `YellowstoneAdapter` — Yellowstone gRPC (Geyser plugin) adaptörü; 100ms altı gecikmeyle gerçek zamanlı account akışı; Triton, Helius, QuickNode, Alchemy tarafından destekleniyor
- ⬜ `VixenAdapter` — [Yellowstone Vixen](https://github.com/rpcpool/yellowstone-vixen) adaptörü; herhangi bir Solana IDL'den üretilen tip güvenli olayları tüketir; Triton'ın Vixen Streams servisiyle uyumlu
- ⬜ `CarbonAdapter` — [Carbon](https://github.com/sevenlabs-hq/carbon) Rust pipeline entegrasyonu; 40+ hazır decoder ile decode edilmiş account/transaction olaylarını ORM katmanına aktarır

### Yazma / Instruction Desteği (IDL tabanlı)

- ⬜ IDL tabanlı instruction builder — Anchor IDL'ini (`idl.json`) ayrıştırarak her instruction için tip güvenli `send()` / `execute()` metodları otomatik üretir; elle `TransactionInstruction` yazmaya gerek kalmaz
- ⬜ `orm.models.task.create({ ... })` — IDL instruction'larını derleyen, PDA seed'lerini çözen ve işlemi tek seferde imzalayıp gönderen yüksek seviyeli yazma API'si
- ⬜ `orm.models.task.update({ where, data })` / `orm.models.task.delete({ where })` — IDL'den üretilen güncelleme ve silme sarmalayıcıları
- ⬜ Transaction builder — birden fazla instruction'ı otomatik account çözümlemesiyle tek transaction'a birleştir

## Katkı

Şu anda en yüksek değerli katkılar:

1. **`HeliusAdapter`** — `QueryAdapter` arayüzü belgelenmiş, Helius DAS API herkese açık
2. **`YellowstoneAdapter`** — gRPC akış adaptörü; gerçek zamanlı account güncellemeleri sağlar, polling'i ortadan kaldırır
3. **IDL instruction builder** — `idl.json`'ı ayrıştır, tip güvenli `send()` metodları üret; tam okuma+yazma ORM deneyimini açar
4. **`Vec<T>` alan desteği** — `FieldType` union ve seri kaldırıcıyı genişlet
5. **`Option<T>` alan desteği** — Borsh'un isteğe bağlı değerler için yazdığı 1 baytlık varlık önekini işle
6. **Enum alanlar** — `u8` değerlerini şema üzerinden string enum'a eşle

[GitHub](https://github.com/vertext-labs/orm)'da bir PR aç.
