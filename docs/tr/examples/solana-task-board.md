# Solana Görev Panosu

Görevleri Solana devnet üzerinde Anchor PDA account'ları olarak saklayan ve `@curvhex/orm` ile sorgulayan tam stack bir örnek.

**Canlı demo:** [task-borad.vercel.app](https://task-borad.vercel.app)  
**Kaynak kod:** `examples/solana/task-board/`

---

## Ne gösteriyor?

| Özellik | Nerede |
|---|---|
| Anchor discriminator ile `defineModel` | `app/lib/orm.ts` |
| `findMany` ile status filtresi | `app/app/api/tasks/route.ts` |
| `aggregate` — toplam sayım | `app/app/api/tasks/route.ts` |
| `groupBy` — status'a göre dağılım | `app/app/api/tasks/route.ts` |
| Anchor programı (Rust) | `programs/program/src/lib.rs` |
| Seed scripti | `app/scripts/seed.ts` |

---

## Mimari

```
Tarayıcı (Next.js)
  └─ GET /api/tasks?status=1
       └─ Server route
            └─ @curvhex/orm
                 └─ getProgramAccounts (Solana RPC)
                      └─ Devnet PDA'ları
```

Tarayıcı RPC'ye hiç dokunmuyor. Next.js API route, ORM instance'ını kendisi yönetiyor ve düz JSON döndürüyor.

---

## 1. Modeli tanımla

Anchor struct'ını alan alan yansıt. `string` alanlar için `maxLen` vermek gerekiyor — ORM'un alanın on-chain'de kaç byte kapladığını bilmesi için (Anchor string'leri `4-byte uzunluk öneki + içerik` olarak saklar).

```ts
// app/lib/orm.ts
import { CurvhexORM, defineModel, anchor } from '@curvhex/orm'
import { Connection } from '@solana/web3.js'

export const TaskModel = defineModel({
  discriminator: anchor('Task'),   // sha256("account:Task")[0..8]
  fields: {
    owner:     { type: 'publicKey' },
    taskId:    { type: 'u64' },
    title:     { type: 'string', maxLen: 64 },  // Anchor'ın MAX_TITLE_LEN'iyle eşleşir
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

> **Neden `maxLen`?**  
> Anchor, string'leri gerçek byte uzunluklarıyla saklar — `maxLen`'e kadar doldurmaz. Struct içinde bir `string` alanından sonra gelen alanların on-chain offset'i kayıt başına değişir. Bu yüzden ORM, bu alanlar için `memcmp` filtresi kullanamaz; bunun yerine tüm account'ları çekip deserialize ettikten sonra client-side filtreler. `maxLen` parametresi sadece alanın değişken uzunluklu olduğunu bildirir; deserializer her zaman runtime'daki gerçek offset'i okur.

---

## 2. On-chain account'ları sorgula

```ts
// GET /api/tasks?status=0
const orm = getOrm()

// Status'a göre filtrele — status, değişken uzunluklu title'dan sonra geldiği için client-side çalışır
const tasks = await orm.models.task.findMany({
  where: { status: Number(statusParam) },
})

// Toplam görev sayısı
const stats = await orm.models.task.aggregate({ _count: true })

// Status'a göre dağılım
const byStatus = await orm.models.task.groupBy({
  by: ['status'],
  _count: true,
})
```

---

## 3. Anchor programı

On-chain program (Rust / Anchor) iki instruction sunuyor:

```rust
// create_task(task_id, title, priority)
// Seed'ler: ["task", owner, task_id_le_bytes]
pub fn create_task(ctx, task_id: u64, title: String, priority: u8) -> Result<()>

// update_status(task_id, status)
pub fn update_status(ctx, _task_id: u64, status: u8) -> Result<()>
```

Account layout (`TaskModel` ile birebir eşleşir):

```
8   byte   discriminator
32  byte   owner (pubkey)
8   byte   task_id (u64 LE)
4+N byte   title (uzunluk önekli string, N ≤ 64)
1   byte   priority
1   byte   status
8   byte   created_at (i64 LE)
```

---

## 4. Demo verisi oluştur

Seed scripti, panonun üç sütununun da dolu görünmesi için farklı status'lara sahip görevler oluşturur:

```ts
// scripts/seed.ts
const DEMO_TASKS = [
  { title: 'Set up Anchor program',    priority: 3, status: 2 }, // Tamamlandı
  { title: 'Write ORM schema',         priority: 3, status: 2 }, // Tamamlandı
  { title: 'Build Next.js frontend',   priority: 2, status: 2 }, // Tamamlandı
  { title: 'Deploy program to devnet', priority: 3, status: 1 }, // Devam Ediyor
  { title: 'Integrate ORM with API',   priority: 2, status: 1 }, // Devam Ediyor
  { title: 'Deploy to Vercel',         priority: 2, status: 0 }, // Yapılacak
  { title: 'Write tutorial README',    priority: 1, status: 0 }, // Yapılacak
  { title: 'Add unit tests',           priority: 1, status: 0 }, // Yapılacak
]
```

Çalıştır:

```bash
cd examples/solana/task-board/program/app
NEXT_PUBLIC_PROGRAM_ID=5HQnXH... \
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com \
WALLET_PATH=/path/to/keypair.json \
npx tsx scripts/seed.ts
```

---

## Lokalda çalıştırma

```bash
# 1. Anchor programını deploy et
cd examples/solana/task-board/program
anchor program deploy

# 2. Next.js uygulamasını başlat
cd app
cp .env.example .env.local   # PROGRAM_ID ve RPC_URL'i doldur
npm install
npm run dev

# 3. Demo verisi oluştur
npx tsx scripts/seed.ts
```
