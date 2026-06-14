# Task Board — Solana example for @curvhex/orm

A minimal on-chain task manager that shows how to query Anchor PDA accounts
with **@curvhex/orm** using a Prisma-style API.

```
examples/solana/task-board/
├── program/   Anchor program (Task PDA accounts)
└── app/       Next.js frontend (reads chain data with @curvhex/orm)
```

## What this demonstrates

| ORM feature                   | Where used                                        |
| ----------------------------- | ------------------------------------------------- |
| `defineModel` + `anchor()`    | `app/lib/orm.ts` — schema mirrors the Rust struct |
| `findMany({ where })`         | `/api/tasks` route — filter by status             |
| `aggregate({ _count, _sum })` | `/api/tasks` route — total task count             |
| `groupBy({ by: ["status"] })` | `/api/tasks` route — tasks per status column      |

## Quick start

### 1 — Deploy the Anchor program

```bash
cd program

# Make sure your wallet has devnet SOL
solana config set --url devnet
solana airdrop 2           # repeat if rate-limited

anchor build
anchor deploy
# → Program Id: 5HQnXH…
```

### 2 — Seed demo tasks on devnet

```bash
cd app
cp .env.local.example .env.local   # set NEXT_PUBLIC_PROGRAM_ID if different

npm install
npm run seed
# Creates 6 demo Task PDA accounts on devnet
```

### 3 — Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 4 — Deploy to Vercel

```bash
vercel
# Set env vars in Vercel dashboard:
#   NEXT_PUBLIC_PROGRAM_ID  =  5HQnXH…
#   NEXT_PUBLIC_RPC_URL     =  https://api.devnet.solana.com
#   WALLET_PATH             =  /home/user/.config/solana/id.json
```

## How the ORM schema maps to the Rust struct

```rust
// Rust (Anchor)
#[account]
pub struct Task {
    pub owner:      Pubkey,  // publicKey
    pub task_id:    u64,     // u64
    pub title:      String,  // string
    pub priority:   u8,      // u8  — 1=low 2=medium 3=high
    pub status:     u8,      // u8  — 0=todo 1=in_progress 2=done
    pub created_at: i64,     // i64
}
```

```ts
// TypeScript (@curvhex/orm)
export const TaskModel = defineModel({
  discriminator: anchor("Task"),
  fields: {
    owner: { type: "publicKey" },
    taskId: { type: "u64" },
    title: { type: "string", maxLen: 64 },
    priority: { type: "u8" },
    status: { type: "u8" },
    createdAt: { type: "i64" },
  },
});
```

## Env vars

| Variable                 | Default                         | Description                        |
| ------------------------ | ------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_PROGRAM_ID` | `5HQnXH…`                       | Deployed program ID                |
| `NEXT_PUBLIC_RPC_URL`    | `https://api.devnet.solana.com` | Solana RPC endpoint                |
| `WALLET_PATH`            | `~/.config/solana/id.json`      | Path to Solana wallet keypair file |
