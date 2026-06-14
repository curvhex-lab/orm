# Roadmap

## Released (v0.1.x)

- ✅ Schema definition with automatic offset calculation
- ✅ Borsh deserialization — all primitive types (`u8`–`u128`, `i8`–`i128`, `bool`, `publicKey`, `string`, `bytes`)
- ✅ `findMany` — `memcmp` on-chain filters + client-side range operators
- ✅ `findFirst`, `findByAddress`, `findByPda`
- ✅ `count`, `aggregate`, `groupBy`
- ✅ `include` — relation loading with address deduplication
- ✅ `anchor()` discriminator helper
- ✅ Adapter pattern (`QueryAdapter` interface)
- ✅ `RpcAdapter` — `getProgramAccounts` implementation

## In Progress

- 🔜 `HeliusAdapter` — Helius DAS API integration
- 🔜 `PostgresAdapter` — Geyser-indexed Postgres + sync guide

## Planned

- ⬜ Cursor-based pagination (`cursor` option on `findMany`)
- ⬜ WebSocket subscriptions (`watch()` — wraps `onAccountChange`)
- ⬜ Enum field support — map `u8` values to string variants via schema
- ⬜ `Option<T>` field support — handle Borsh option prefix byte
- ⬜ `Vec<T>` field support — variable-length arrays
- ⬜ CLI: `curvhex generate` — generate schema from Anchor IDL
- ⬜ RPC 2.0 adapter (Triton) — when the spec stabilises

## Contributing

Want to help ship any of these? The highest-value contributions right now are:

1. **`HeliusAdapter`** — good first large contribution; the `QueryAdapter` interface is documented and the Helius DAS API is public
2. **`Vec<T>` field support** — extend `FieldType` union and the deserializer
3. **`Option<T>` field support** — handle the 1-byte presence prefix Borsh writes before optional values
4. **Enum fields** — add a schema option to map `u8` values to a string enum

See [Adding a Custom Adapter](/guide/custom-adapter) and the [Architecture](/guide/architecture) docs to get oriented, then open a PR on [GitHub](https://github.com/vertext-labs/orm).
