# defineModel

Defines an account schema. Returns a typed `ModelDefinition` used throughout the query API.

## Signature

```typescript
function defineModel(input: {
  discriminator: number[]
  fields: Record<string, { type: FieldType }>
}): ModelDefinition
```

## Parameters

### `discriminator`

`number[]` — The byte prefix that identifies this account type. Use `anchor('AccountName')` for Anchor programs, or pass raw bytes for native programs.

### `fields`

An ordered map of field name → `{ type: FieldType }`. **Order matters** — fields must match the serialization order in the on-chain program, because byte offsets are computed sequentially.

## Example

```typescript
import { defineModel, anchor } from '@curvhex/orm'

const UserAccount = defineModel({
  discriminator: anchor('UserAccount'),
  fields: {
    authority: { type: 'publicKey' },
    balance:   { type: 'u64' },
    tier:      { type: 'u8' },
    isActive:  { type: 'bool' },
    name:      { type: 'string' },
  },
})
```

## Return Value

A `ModelDefinition` object with computed `offset` values per field:

```typescript
{
  discriminator: [149, 88, 201, ...],
  fields: {
    authority: { type: 'publicKey', offset: 8  },
    balance:   { type: 'u64',       offset: 40 },
    tier:      { type: 'u8',        offset: 48 },
    isActive:  { type: 'bool',      offset: 49 },
    name:      { type: 'string',    offset: 50 },
  }
}
```

## `anchor(name)`

Computes the 8-byte Anchor account discriminator for a given account name. The algorithm is `sha256("account:<name>")[0..8]` — the same hash Anchor uses.

```typescript
import { anchor } from '@curvhex/orm'

anchor('UserAccount') // → [149, 88, 201, 24, 166, 41, 99, 218]
```

## Type Inference

Use `InferModel` to extract the TypeScript type of a model's query result:

```typescript
import type { InferModel } from '@curvhex/orm'

type User = InferModel<typeof UserAccount>
// {
//   address:   string
//   authority: string   ← publicKey → string (base58)
//   balance:   bigint   ← u64 → bigint
//   tier:      number   ← u8 → number
//   isActive:  boolean  ← bool → boolean
//   name:      string   ← string → string
// }
```
