---
layout: home

hero:
  name: "Curvhex ORM"
  text: "Prisma for Solana PDAs"
  tagline: Query, filter, and aggregate on-chain accounts with a familiar TypeScript API. Swap from RPC to Helius to Postgres without touching your queries.
  image:
    src: /logo.svg
    alt: Curvhex ORM
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: API Reference
      link: /api/define-model
    - theme: alt
      text: View on GitHub
      link: https://github.com/vertext-labs/orm

features:
  - icon: 🔍
    title: Familiar Query API
    details: Write queries exactly like Prisma — findMany, findFirst, count, aggregate, groupBy. No more manual memcmp byte math.

  - icon: ⚡
    title: Adapter-Agnostic
    details: Start on any RPC endpoint for free. Switch to Helius or your own Postgres indexer as you scale — zero query changes.

  - icon: 🧩
    title: Type-Safe by Default
    details: Schema definitions drive full TypeScript inference. Your query results are typed exactly to the fields you defined.

  - icon: 🔗
    title: Relations
    details: Load related accounts with include. Automatically deduplicates — 100 vaults sharing an owner fetch that owner only once.

  - icon: 🧮
    title: Aggregations
    details: sum, avg, min, max, count and groupBy — all running client-side over RPC today, moving server-side as adapters mature.

  - icon: 🪝
    title: Auto Discriminators
    details: Built-in anchor() helper computes the 8-byte Anchor discriminator from any account name. No IDL parsing required.
---
