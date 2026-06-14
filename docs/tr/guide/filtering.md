# Filtreleme

Curvhex ORM iki kategori filtre destekler: **zincir üstü** (`memcmp` olarak RPC'ye gönderilir) ve **istemci taraflı** (çekildikten sonra uygulanır).

## Zincir Üstü ve İstemci Taraflı

| Filtre | RpcAdapter | HeliusAdapter | PostgresAdapter |
|--------|-----------|---------------|-----------------|
| Eşitlik (`alan: değer`) | ✅ `memcmp` | ✅ | ✅ |
| Aralık (`gt`, `gte`, `lt`, `lte`) | ⚠️ istemci taraflı | ✅ | ✅ |
| Küme (`in`, `not`) | ⚠️ istemci taraflı | ✅ | ✅ |
| `between` | ⚠️ istemci taraflı | ✅ | ✅ |

**Zincir üstü filtreler** (eşitlik) RPC'ye `memcmp` kısıtlaması olarak gönderilir — yalnızca eşleşen hesaplar aktarılır. Hızlı ve verimlidir.

**İstemci taraflı filtreler** önce zincir üstü filtreleri geçen tüm hesapları çekmeyi, ardından bellekte filtrelemeyi gerektirir. En iyi performans için zincir üstü eşitlik filtreleriyle istemci taraflı aralık filtrelerini birleştir.

## Eşitlik Filtreleri

Tam eşleşme için doğrudan bir değer ilet. Tüm ilkel alan türlerinde desteklenir.

```typescript
where: {
  isActive:  true,
  tier:      2,
  authority: 'Abc123...',
}
```

## Aralık Operatörleri

Sayısal alanlar için kullanılabilir (`u8`–`u128`, `i8`–`i128`).

```typescript
where: {
  balance: { gt:  1000n },
  balance: { gte: 1000n },
  balance: { lt:  50000n },
  balance: { lte: 50000n },
}
```

## `between`

`gte` + `lte` için kısaltma.

```typescript
where: {
  balance: { between: [1000n, 50000n] },
}
```

## `in`

Bir kümedeki herhangi bir değerle eşleşir.

```typescript
where: {
  tier: { in: [1, 2, 3] },
}
```

## `not`

Belirli bir değeri hariç tutar.

```typescript
where: {
  tier: { not: 0 },
}
```

## `dataSize`

Hesap verisinin bayt boyutuna göre filtrele.

```typescript
const users = await orm.models.userAccount.findMany({
  dataSize: 165,
})
```

## Performans İpuçları

1. **Eşitlik filtrelerini tercih et** — ücretsizdir (zincir üstü). Aralık filtreleri tüm eşleşen hesaplar için ağ gidiş-dönüşü maliyeti getirir.
2. **Ölçek için adaptör değiştir** — `HeliusAdapter` veya `PostgresAdapter` aralık sorgularını sunucu tarafında çalıştırır.
