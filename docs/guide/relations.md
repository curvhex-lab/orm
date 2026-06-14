# Relations

Curvhex ORM can load related accounts in a single query call using the `include` option. It automatically deduplicates fetches — if 100 vaults reference the same owner, that owner account is fetched exactly once.

## Basic `include`

Define a relation by specifying the related model and the field on the current model that holds the other account's public key (`foreignKey`).

```typescript
const VaultAccount = defineModel({
  discriminator: anchor('VaultAccount'),
  fields: {
    ownerPubkey: { type: 'publicKey' },
    totalLocked: { type: 'u64' },
    isActive:    { type: 'bool' },
  },
})

const UserAccount = defineModel({
  discriminator: anchor('UserAccount'),
  fields: {
    authority: { type: 'publicKey' },
    balance:   { type: 'u64' },
    tier:      { type: 'u8' },
  },
})

const vaults = await orm.models.vaultAccount.findMany({
  where:   { totalLocked: { gt: 1000n } },
  include: {
    owner: {
      model:      UserAccount,
      foreignKey: 'ownerPubkey',
    },
  },
})
```

**Result shape:**

```typescript
[
  {
    address:     'Vault1...',
    ownerPubkey: 'User1...',
    totalLocked: 5000n,
    isActive:    true,
    owner: {
      address:   'User1...',
      authority: 'Wallet1...',
      balance:   99500n,
      tier:      2,
    },
  },
  // ...
]
```

If the referenced account doesn't exist on-chain, `owner` will be `null`.

## Multiple Relations

Include multiple relations in the same query:

```typescript
const positions = await orm.models.position.findMany({
  where: { isOpen: true },
  include: {
    user:   { model: UserAccount,  foreignKey: 'userPubkey' },
    market: { model: MarketAccount, foreignKey: 'marketPubkey' },
  },
})
```

## Deduplication

If multiple accounts share the same related account, it is fetched only once:

```typescript
// 500 vaults, but only 12 unique owners
// → 12 fetchAccount calls, not 500
const vaults = await orm.models.vaultAccount.findMany({
  include: { owner: { model: UserAccount, foreignKey: 'ownerPubkey' } },
})
```

## Performance Considerations

With `RpcAdapter` and `HeliusAdapter`, relations are resolved via individual `getAccountInfo` calls per unique address. This is efficient for high-deduplication cases (many accounts → few related accounts).

For low-deduplication cases (most accounts have a unique related account), consider whether you actually need the related data in the same query, or can fetch it lazily.

With `PostgresAdapter` *(coming soon)*, relations are resolved via SQL JOINs with no N+1 cost.
