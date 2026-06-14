# Özel Adaptör Ekleme

Curvhex ORM'nin adaptör arayüzü basittir — üç metod uygula ve ORM'deki her sorguyla çalışan tam işlevsel bir adaptöre sahip ol.

## Arayüz

```typescript
export interface QueryAdapter {
  findMany<M extends ModelDefinition>(
    model:   M,
    options: FindManyOptions<M>,
  ): Promise<(InferModel<M> & { address: string })[]>

  findByAddress<M extends ModelDefinition>(
    model:   M,
    address: string,
  ): Promise<(InferModel<M> & { address: string }) | null>

  findByPda<M extends ModelDefinition>(
    model:  M,
    seeds:  (Buffer | Uint8Array)[],
  ): Promise<(InferModel<M> & { address: string }) | null>
}
```

## Adım Adım Örnek

Test için kullanışlı olan bellek içi bir adaptör örneği:

```typescript
// src/adapters/InMemoryAdapter.ts
import { QueryAdapter, FindManyOptions, ModelDefinition, InferModel } from '@curvhex/orm'

type AnyAccount = Record<string, unknown> & { address: string }

export class InMemoryAdapter implements QueryAdapter {
  private store: Map<string, AnyAccount> = new Map()

  seed(accounts: AnyAccount[]) {
    for (const account of accounts) {
      this.store.set(account.address, account)
    }
  }

  async findMany<M extends ModelDefinition>(
    model:   M,
    options: FindManyOptions<M>,
  ): Promise<(InferModel<M> & { address: string })[]> {
    let results = [...this.store.values()] as (InferModel<M> & { address: string })[]

    if (options.where) {
      results = results.filter(account =>
        Object.entries(options.where!).every(([key, value]) =>
          (account as any)[key] === value
        )
      )
    }

    const skip = options.skip ?? 0
    const take = options.take ?? results.length
    return results.slice(skip, skip + take)
  }

  async findByAddress<M extends ModelDefinition>(
    model:   M,
    address: string,
  ): Promise<(InferModel<M> & { address: string }) | null> {
    return (this.store.get(address) as any) ?? null
  }

  async findByPda<M extends ModelDefinition>(
    model: M,
    seeds: (Buffer | Uint8Array)[],
  ): Promise<(InferModel<M> & { address: string }) | null> {
    return null
  }
}
```

## İpuçları

- **HTTP tabanlı adaptörler için** (Helius, özel REST): API'yi `findMany` içinde çağır, yanıtı şemanın alan adlarına eşle.
- **Veritabanı adaptörleri için**: `where` seçeneklerini SQL `WHERE` cümlelerine çevir.
- **Ham `Buffer` verisi için**: seri kaldırmak üzere `@curvhex/orm/core/deserializer`'ı içe aktar.

Yeni bir adaptör eklerken `src/index.ts`'den dışa aktar ve `integration.test.ts`'e test durumları ekle, ardından bir PR aç.
