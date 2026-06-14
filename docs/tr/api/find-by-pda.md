# findByPda

PDA'yı tohumlardan ve program ID'den türetir, ardından hesabı çeker ve seri kaldırır.

## İmza

```typescript
findByPda(seeds: (Buffer | Uint8Array)[]): Promise<(InferModel<M> & { address: string }) | null>
```

## Örnek

```typescript
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])

if (user) {
  console.log(user.address)  // türetilen PDA adresi
  console.log(user.balance)  // bigint
}
```

## Yaygın Tohum Kalıpları

```typescript
// String öneki + public key
findByPda([Buffer.from('vault'), ownerKey.toBuffer()])

// String öneki + public key + indeks
findByPda([
  Buffer.from('position'),
  userKey.toBuffer(),
  Buffer.from(new Uint8Array(new Uint32Array([index]).buffer)),
])
```

## Notlar

- PDA türetme `@solana/web3.js`'den `PublicKey.findProgramAddressSync`'i kullanır.
- Türetilen adreste hesap yoksa `null` döner.
- `findByAddress` gibi her zaman doğrudan RPC'ye gider.
