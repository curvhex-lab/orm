# Schema Definition

Schemas describe the layout of your on-chain Anchor accounts. Curvhex ORM uses them for two things: computing `memcmp` byte offsets for on-chain filtering, and deserializing raw account data into typed TypeScript objects.

## `defineModel`

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

### `discriminator`

The 8-byte prefix that Anchor writes at the start of every account to identify its type.

**Anchor programs:** use the `anchor()` helper — it computes the discriminator from the account name using the same hash Anchor uses:

```typescript
import { anchor } from '@curvhex/orm'

anchor('UserAccount') // → [149, 88, 201, 24, 166, 41, 99, 218]
```

**Native programs:** provide the raw bytes directly:

```typescript
discriminator: [1, 2, 3, 4, 5, 6, 7, 8]
```

**No discriminator:** pass an empty array:

```typescript
discriminator: []
```

### `fields`

An ordered map of field names to their definitions. **Order matters** — fields must be declared in the same order Anchor serializes them, because offsets are computed sequentially.

```typescript
fields: {
  fieldName: { type: FieldType }
}
```

## Field Types

| Type | Size | TypeScript type | Notes |
|------|------|-----------------|-------|
| `u8` | 1 byte | `number` | |
| `u16` | 2 bytes | `number` | little-endian |
| `u32` | 4 bytes | `number` | little-endian |
| `u64` | 8 bytes | `bigint` | little-endian |
| `u128` | 16 bytes | `bigint` | little-endian |
| `i8` | 1 byte | `number` | |
| `i16` | 2 bytes | `number` | little-endian |
| `i32` | 4 bytes | `number` | little-endian |
| `i64` | 8 bytes | `bigint` | little-endian |
| `i128` | 16 bytes | `bigint` | little-endian |
| `bool` | 1 byte | `boolean` | |
| `publicKey` | 32 bytes | `string` | base58-encoded |
| `string` | 4 + N bytes | `string` | Borsh: u32 length prefix + UTF-8 |
| `bytes` | 4 + N bytes | `string` | Borsh: u32 length prefix + raw bytes → hex |

::: warning Variable-Length Fields
`string` and `bytes` fields have variable lengths. Placing them before fixed-size fields means offsets for subsequent fields cannot be computed statically. Put variable-length fields **last** to enable on-chain `memcmp` filtering on all preceding fields.
:::

## Type Inference

`defineModel` returns a fully typed model. Use `InferModel` to extract the TypeScript type of a result:

```typescript
import type { InferModel } from '@curvhex/orm'

type User = InferModel<typeof UserAccount>
// {
//   address:   string
//   authority: string
//   balance:   bigint
//   tier:      number
//   isActive:  boolean
//   name:      string
// }
```

All query results (`findMany`, `findFirst`, etc.) are automatically typed as `InferModel<M>`.

## Memory Layout Example

Given this schema:

```typescript
const UserAccount = defineModel({
  discriminator: anchor('UserAccount'), // 8 bytes → offset 0
  fields: {
    authority: { type: 'publicKey' }, // 32 bytes → offset 8
    balance:   { type: 'u64' },       // 8 bytes  → offset 40
    tier:      { type: 'u8' },        // 1 byte   → offset 48
    isActive:  { type: 'bool' },      // 1 byte   → offset 49
    name:      { type: 'string' },    // variable → offset 50
  },
})
```

When you filter `{ authority: wallet.publicKey }`, the ORM sends `memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() }` to the RPC — matching Anchor's exact memory layout.
