# Adding a Custom Adapter

Curvhex ORM's adapter interface is simple — implement three methods and you have a fully working adapter that works with every query in the ORM.

## The Interface

```typescript
import type { ModelDefinition, InferModel } from '@curvhex/orm'
import type { FindManyOptions } from '@curvhex/orm'

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

## Step-by-Step Example

Here's a minimal example adapter backed by a local in-memory store — useful for testing.

### 1. Create the adapter file

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

    // Apply where filters
    if (options.where) {
      results = results.filter(account =>
        Object.entries(options.where!).every(([key, value]) =>
          (account as any)[key] === value
        )
      )
    }

    // Apply take/skip
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
    // Derive PDA and look up — for real adapters use PublicKey.findProgramAddressSync
    return null
  }
}
```

### 2. Use it in the ORM

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { InMemoryAdapter } from './adapters/InMemoryAdapter'

const adapter = new InMemoryAdapter()
adapter.seed([
  { address: 'Abc123', authority: 'Xyz...', balance: 5000n, isActive: true },
])

const orm = new CurvhexORM({
  connection,
  programId: 'YOUR_PROGRAM_ID',
  models:    { UserAccount },
  adapter,
})

const users = await orm.models.userAccount.findMany({ where: { isActive: true } })
```

## Tips for Real Adapters

- **For HTTP-based adapters** (Helius, custom REST): call the API inside `findMany`, map the response to the schema's field names, and return typed results.
- **For database adapters**: translate `where` options to SQL `WHERE` clauses and `orderBy` to `ORDER BY`. The `FindManyOptions` type documents every possible option.
- **Deserialization**: if your adapter returns raw `Buffer` data, import and use the deserializer from `@curvhex/orm/core/deserializer` to convert it to a typed object.
- **Export your adapter** from your package entry point and open a PR — adapters are a great contribution target.
