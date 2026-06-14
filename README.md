<p align="center">
  <img src="docs/public/logo.svg" width="80" alt="Curvhex ORM" />
</p>

<h1 align="center">Curvhex ORM</h1>

<p align="center">
  TypeScript ORM for Solana PDA accounts.<br/>
  Query, filter, and aggregate on-chain data with a Prisma-style API.
</p>

<p align="center">
  <a href="https://curvhex-lab.github.io/orm/">Documentation</a> ·
  <a href="https://curvhex-lab.github.io/orm/guide/quick-start">Quick Start</a> ·
  <a href="https://www.npmjs.com/package/@curvhex/orm">npm</a>
</p>

---

```typescript
const users = await orm.models.userAccount.findMany({
  where: { authority: wallet.publicKey, isActive: true },
  orderBy: { balance: "desc" },
  take: 10,
});
```

## Installation

```bash
npm install @curvhex/orm @solana/web3.js
```

## Documentation

Full documentation at **[curvhex-labs.github.io/orm](https://curvhex-lab.github.io/orm/)**.

## License

Apache 2.0 with Commons Clause.
