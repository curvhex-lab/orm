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

### Indexing Adapters (from Solana indexing ecosystem)

These adapters address the limitations of standard `getProgramAccounts` (rate limits, no persistence, polling overhead) for production-grade use cases:

- ⬜ `YellowstoneAdapter` — Yellowstone gRPC (Geyser plugin) adapter for real-time account streaming with sub-100ms latency; supported by Triton, Helius, QuickNode, Alchemy
- ⬜ `VixenAdapter` — [Yellowstone Vixen](https://github.com/rpcpool/yellowstone-vixen) adapter; consumes typed, structured events generated from any Solana IDL; works with Triton's hosted Vixen Streams
- ⬜ `CarbonAdapter` — [Carbon](https://github.com/sevenlabs-hq/carbon) Rust-pipeline integration; exposes decoded account/transaction events to the ORM layer via 40+ pre-built decoders

### Write / Instruction Support (IDL-based)

- ⬜ IDL-driven instruction builder — parse an Anchor IDL (`idl.json`) and auto-generate typed `send()` / `execute()` methods for each instruction (create, update, delete); removes the need to hand-write `TransactionInstruction` calls
- ⬜ `orm.models.task.create({ ... })` — high-level write API that compiles IDL instructions, resolves PDA seeds, and signs/sends the transaction in one call
- ⬜ `orm.models.task.update({ where, data })` / `orm.models.task.delete({ where })` — update and delete wrappers generated from the IDL
- ⬜ Transaction builder — compose multiple instructions into a single transaction with automatic account resolution

## Contributing

Want to help ship any of these? The highest-value contributions right now are:

1. **`HeliusAdapter`** — good first large contribution; the `QueryAdapter` interface is documented and the Helius DAS API is public
2. **`YellowstoneAdapter`** — gRPC streaming adapter; brings real-time account updates and eliminates polling
3. **IDL instruction builder** — parse `idl.json`, generate typed `send()` methods; unlocks the full read+write ORM experience
4. **`Vec<T>` field support** — extend `FieldType` union and the deserializer
5. **`Option<T>` field support** — handle the 1-byte presence prefix Borsh writes before optional values
6. **Enum fields** — add a schema option to map `u8` values to a string enum

See [Adding a Custom Adapter](/guide/custom-adapter) and the [Architecture](/guide/architecture) docs to get oriented, then open a PR on [GitHub](https://github.com/vertext-labs/orm).
