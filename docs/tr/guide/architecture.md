# Mimari

## Genel Bakış

```
Kodun
    │
    ▼
CurvhexORM            ← giriş noktası; modelleri adaptöre bağlar
    │
    ▼
CurvhexClient         ← model başına sorgu motoru (findMany, aggregate, include…)
    │
    ▼
QueryAdapter          ← soyut arayüz
    ├── RpcAdapter        ← getProgramAccounts + bellekte filtrele/sırala
    ├── HeliusAdapter     ← Helius DAS API             [yakında]
    └── PostgresAdapter   ← pg / postgres istemcisi    [yakında]
```

## Kaynak Yapısı

```
src/
├── core/
│   ├── types.ts          — FieldType, ModelDefinition, InferModel
│   ├── schema.ts         — defineModel(), anchor(), ofset hesabı
│   ├── deserializer.ts   — Buffer → TypeScript nesnesi (Borsh)
│   └── filters.ts        — memcmp oluşturucu + istemci taraflı filtre mantığı
│
├── adapters/
│   ├── abstract/
│   │   └── QueryAdapter.ts   — adaptör arayüzü
│   └── RpcAdapter.ts         — getProgramAccounts uygulaması
│
└── client/
    ├── CurvhexClient.ts   — findMany, findFirst, aggregate, groupBy, include
    └── CurvhexORM.ts      — giriş noktası; modelleri → adaptörü → istemciyi bağlar
```

## Temel Tasarım Kararları

### Neden adaptör arayüzü?

Solana'nın native RPC'si yalnızca `memcmp`'yi destekler. Aralık sorguları, agregasyon ve gerçek sıralama off-chain altyapı gerektirir. Tek bir çözüm seçmek yerine adaptör arayüzü veri kaynağını değiştirilebilir kılarken sorgu kodunu kararlı tutar.

### Neden RpcAdapter'da istemci taraflı filtreleme?

`RpcAdapter` aralık sorgularını RPC'ye itkleyemez — `memcmp` filtrelerini geçen tüm hesapları çeker ve aralık mantığını bellekte uygular. Bu, varsayılan adaptör için doğru değiş tokuştur: herhangi bir RPC uç noktasında çalışır, küçük-orta büyüklükteki programlar için doğrudur ve açıkça belgelenmiş bir sınırlamadır.

### Otomatik bayt ofsetleri

`defineModel`, şema tanımı zamanında her alanın bayt ofsetini hesaplar. Bu, Anchor'ın hesapları bellekte düzenleme şekliyle tam olarak örtüşür — IDL ayrıştırması veya manuel bayt matematiği yok.

### `InferModel` — derleme zamanı tipleme

`InferModel<M>` yardımcı tipi, her alanın `FieldType`'ını TypeScript karşılığına eşler. Her sorgu metodu `M extends ModelDefinition` üzerinde generiktir ve `InferModel<M>[]` döndürür — manuel tip ek açıklaması olmadan tam tipleme sağlar.

### İlişki tekilleştirme

`include`, çekilen hesaplardan tüm yabancı anahtar değerlerini toplar, bir `Set` ile tekilleştirir, ardından benzersiz adres başına bir `getAccountInfo` çağrısı yapar. Sonuçlar bir `Map<adres, İlgiliHesap>`'ta saklanır ve her üst hesaba eklenir.
