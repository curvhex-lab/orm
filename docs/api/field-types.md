# Field Types

All supported field types, their byte sizes, TypeScript representations, and notes on how they're deserialized.

## Numeric Types

| Type | Size | TypeScript | Encoding |
|------|------|------------|---------|
| `u8` | 1 byte | `number` | unsigned |
| `u16` | 2 bytes | `number` | unsigned, little-endian |
| `u32` | 4 bytes | `number` | unsigned, little-endian |
| `u64` | 8 bytes | `bigint` | unsigned, little-endian |
| `u128` | 16 bytes | `bigint` | unsigned, little-endian |
| `i8` | 1 byte | `number` | signed two's complement |
| `i16` | 2 bytes | `number` | signed, little-endian |
| `i32` | 4 bytes | `number` | signed, little-endian |
| `i64` | 8 bytes | `bigint` | signed, little-endian |
| `i128` | 16 bytes | `bigint` | signed, little-endian |

::: tip bigint
`u64`, `u128`, `i64`, and `i128` fields are typed as `bigint` in TypeScript. Use `n` suffix for literals: `1000n`, `{ gt: 500n }`.
:::

## Boolean

| Type | Size | TypeScript |
|------|------|------------|
| `bool` | 1 byte | `boolean` |

A `bool` field is `true` if the byte is `1`, `false` if `0`.

## Public Key

| Type | Size | TypeScript |
|------|------|------------|
| `publicKey` | 32 bytes | `string` (base58) |

Deserialized as a base58-encoded string. Use `new PublicKey(field)` from `@solana/web3.js` if you need a `PublicKey` object.

## Variable-Length Types

| Type | Size | TypeScript | Encoding |
|------|------|------------|---------|
| `string` | 4 + N bytes | `string` | Borsh: u32 length prefix (LE) + UTF-8 bytes |
| `bytes` | 4 + N bytes | `string` | Borsh: u32 length prefix (LE) + raw bytes → hex string |

::: warning Variable-Length Fields and Offsets
Because `string` and `bytes` have dynamic sizes, the ORM cannot compute static byte offsets for any fields that come *after* them in the schema. Place variable-length fields **last** to preserve on-chain `memcmp` filtering for all preceding fixed-size fields.
:::

## Field Type Reference in Code

```typescript
import type { FieldType } from '@curvhex/orm'

// All valid FieldType values:
type FieldType =
  | 'u8' | 'u16' | 'u32' | 'u64' | 'u128'
  | 'i8' | 'i16' | 'i32' | 'i64' | 'i128'
  | 'bool'
  | 'publicKey'
  | 'string'
  | 'bytes'
```

## Planned Types

The following types are on the roadmap and not yet supported:

| Type | Notes |
|------|-------|
| `enum` | Map `u8` discriminant to string variants |
| `option<T>` | Borsh option — 1-byte presence prefix |
| `vec<T>` | Borsh vector — u32 length prefix + N elements |
