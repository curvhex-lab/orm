# findByPda

Derives the PDA from seeds and program ID, then fetches and deserializes the account.

## Signature

```typescript
findByPda(seeds: (Buffer | Uint8Array)[]): Promise<(InferModel<M> & { address: string }) | null>
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `seeds` | `(Buffer \| Uint8Array)[]` | PDA seeds, in the same order as the on-chain `find_program_address` call |

## Example

```typescript
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])

if (user) {
  console.log(user.address)  // derived PDA address
  console.log(user.balance)  // bigint
}
```

## Common Seed Patterns

```typescript
// String prefix + public key
findByPda([Buffer.from('vault'), ownerKey.toBuffer()])

// String prefix + public key + index
findByPda([
  Buffer.from('position'),
  userKey.toBuffer(),
  Buffer.from(new Uint8Array(new Uint32Array([index]).buffer)), // u32 little-endian
])

// Multiple string prefixes
findByPda([Buffer.from('protocol'), Buffer.from('config')])
```

## Notes

- PDA derivation uses `PublicKey.findProgramAddressSync` from `@solana/web3.js` with the `programId` you passed to `CurvhexORM`.
- Returns `null` if the derived address has no account on-chain.
- Like `findByAddress`, this always hits the RPC directly — use it before transactions that need fresh state.
