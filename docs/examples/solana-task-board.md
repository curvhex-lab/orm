# Solana Task Board

A full-stack example that stores tasks as Anchor PDA accounts on Solana devnet and queries them with `@curvhex/orm`.

**Live demo:** [task-borad.vercel.app](https://task-borad.vercel.app)  
**Source:** `examples/solana/task-board/`

---

## What it demonstrates

| Feature | Where |
|---|---|
| `defineModel` with Anchor discriminator | `app/lib/orm.ts` |
| `findMany` with status filter | `app/app/api/tasks/route.ts` |
| `aggregate` — total count | `app/app/api/tasks/route.ts` |
| `groupBy` — count per status | `app/app/api/tasks/route.ts` |
| Anchor program (Rust) | `programs/program/src/lib.rs` |
| Seed script | `app/scripts/seed.ts` |

---

## Architecture

```
Browser (Next.js)
  └─ GET /api/tasks?status=1
       └─ Server route
            └─ @curvhex/orm
                 └─ getProgramAccounts (Solana RPC)
                      └─ Devnet PDAs
```

The browser never touches the RPC directly. The Next.js API route owns the ORM instance and returns plain JSON.

---

## 1. Define the model

Mirror your Anchor struct field-for-field. For `string` fields, pass `maxLen` so the ORM knows how many bytes the field occupies on-chain (Anchor stores strings as `4-byte length prefix + payload`).

```ts
// app/lib/orm.ts
import { CurvhexORM, defineModel, anchor } from '@curvhex/orm'
import { Connection } from '@solana/web3.js'

export const TaskModel = defineModel({
  discriminator: anchor('Task'),   // sha256("account:Task")[0..8]
  fields: {
    owner:     { type: 'publicKey' },
    taskId:    { type: 'u64' },
    title:     { type: 'string', maxLen: 64 },  // matches Anchor's MAX_TITLE_LEN
    priority:  { type: 'u8' },
    status:    { type: 'u8' },
    createdAt: { type: 'i64' },
  },
})

export function getOrm() {
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!)
  return new CurvhexORM({
    connection,
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID!,
    models: { Task: TaskModel },
  })
}
```

> **Why `maxLen`?**  
> Anchor serializes strings as their actual byte length — not padded to `maxLen`. Fields that come _after_ a `string` in the struct have a variable on-chain offset, so the ORM cannot use `memcmp` filters for them. Instead it fetches all accounts and filters client-side. Providing `maxLen` only informs the ORM that the field is variable-length; the deserializer always reads the correct runtime offset.

---

## 2. Query on-chain accounts

```ts
// GET /api/tasks?status=0
const orm = getOrm()

// Filter by status — client-side because status comes after the variable-length title
const tasks = await orm.models.task.findMany({
  where: { status: Number(statusParam) },
})

// Count all tasks
const stats = await orm.models.task.aggregate({ _count: true })

// Break down by status
const byStatus = await orm.models.task.groupBy({
  by: ['status'],
  _count: true,
})
```

---

## 3. The Anchor program

The on-chain program (Rust / Anchor) exposes two instructions:

```rust
// create_task(task_id, title, priority)
// Seeds: ["task", owner, task_id_le_bytes]
pub fn create_task(ctx, task_id: u64, title: String, priority: u8) -> Result<()>

// update_status(task_id, status)
pub fn update_status(ctx, _task_id: u64, status: u8) -> Result<()>
```

Account layout (matches `TaskModel` above):

```
8   bytes  discriminator
32  bytes  owner (pubkey)
8   bytes  task_id (u64 LE)
4+N bytes  title (length-prefixed string, N ≤ 64)
1   byte   priority
1   byte   status
8   bytes  created_at (i64 LE)
```

---

## 4. Seed demo data

The seed script creates tasks with varied statuses so all three columns of the board are populated:

```ts
// scripts/seed.ts
const DEMO_TASKS = [
  { title: 'Set up Anchor program',    priority: 3, status: 2 }, // Done
  { title: 'Write ORM schema',         priority: 3, status: 2 }, // Done
  { title: 'Build Next.js frontend',   priority: 2, status: 2 }, // Done
  { title: 'Deploy program to devnet', priority: 3, status: 1 }, // In Progress
  { title: 'Integrate ORM with API',   priority: 2, status: 1 }, // In Progress
  { title: 'Deploy to Vercel',         priority: 2, status: 0 }, // To Do
  { title: 'Write tutorial README',    priority: 1, status: 0 }, // To Do
  { title: 'Add unit tests',           priority: 1, status: 0 }, // To Do
]
```

Run it:

```bash
cd examples/solana/task-board/program/app
NEXT_PUBLIC_PROGRAM_ID=5HQnXH... \
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com \
WALLET_PATH=/path/to/keypair.json \
npx tsx scripts/seed.ts
```

---

## Running locally

```bash
# 1. Deploy the Anchor program
cd examples/solana/task-board/program
anchor program deploy

# 2. Start the Next.js app
cd app
cp .env.example .env.local   # fill in PROGRAM_ID and RPC_URL
npm install
npm run dev

# 3. Seed demo data
npx tsx scripts/seed.ts
```
