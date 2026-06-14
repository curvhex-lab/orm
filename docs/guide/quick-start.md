# Quick Start

This guide gets you from zero to running your first query in under 5 minutes.

## 1. Install

```bash
npm install @curvhex/orm @solana/web3.js
```

## 2. Define Your Schema

Create a schema that mirrors your on-chain Anchor account:

```typescript
import { defineModel, anchor } from '@curvhex/orm'

const UserAccount = defineModel({
  discriminator: anchor('UserAccount'), // 8-byte Anchor discriminator

  fields: {
    authority: { type: 'publicKey' }, // 32 bytes
    balance:   { type: 'u64' },       // 8 bytes (bigint)
    tier:      { type: 'u8' },        // 1 byte
    isActive:  { type: 'bool' },      // 1 byte
    name:      { type: 'string' },    // 4 + N bytes (Borsh string)
  },
})
```

::: tip Auto Offsets
Field byte offsets are calculated automatically from the discriminator length and field order — exactly as Anchor lays them out in memory. No manual byte counting.
:::

## 3. Create the ORM

```typescript
import { CurvhexORM } from '@curvhex/orm'
import { Connection, PublicKey } from '@solana/web3.js'

const connection = new Connection('https://api.mainnet-beta.solana.com')

const orm = new CurvhexORM({
  connection,
  programId: new PublicKey('YOUR_PROGRAM_ID'),
  models: { UserAccount },
})
```

## 4. Run Your First Query

```typescript
// Find all active users with balance over 1000, sorted highest first
const users = await orm.models.userAccount.findMany({
  where: {
    isActive: true,
    balance:  { gt: 1000n },
  },
  orderBy: { balance: 'desc' },
  take:    10,
})

console.log(users)
// [
//   { address: 'Abc...', authority: 'Xyz...', balance: 99500n, tier: 2, isActive: true, name: 'Alice' },
//   ...
// ]
```

## 5. More Query Patterns

```typescript
// By PDA seeds
const user = await orm.models.userAccount.findByPda([
  Buffer.from('user'),
  wallet.publicKey.toBuffer(),
])

// By address
const user = await orm.models.userAccount.findByAddress('Abc123...')

// Count
const activeCount = await orm.models.userAccount.count({ isActive: true })

// Aggregate
const stats = await orm.models.userAccount.aggregate({
  where: { isActive: true },
  _sum:  { balance: true },
  _avg:  { balance: true },
})
```

## Next Steps

- [Schema Definition](/guide/schema) — all field types and options
- [Querying](/guide/querying) — complete query API reference
- [Filtering](/guide/filtering) — on-chain vs client-side filters explained
- [Adapters](/guide/adapters) — scaling beyond the default RPC adapter
