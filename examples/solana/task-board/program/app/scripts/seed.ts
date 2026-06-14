/**
 * seed.ts — creates demo Task accounts on Solana devnet with varied statuses.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createHash } from "crypto";
import * as fs from "fs";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

const keypairPath = process.env.WALLET_PATH!;
const raw = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
const payer = Keypair.fromSecretKey(Buffer.from(raw));

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, "confirmed");

// ── Borsh helpers ─────────────────────────────────────────────────────────────

function ixDiscriminator(name: string): Buffer {
  return Buffer.from(
    createHash("sha256").update(`global:${name}`).digest().slice(0, 8)
  );
}

function taskPda(taskId: bigint): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("task"),
      payer.publicKey.toBuffer(),
      (() => { const b = Buffer.alloc(8); b.writeBigUInt64LE(taskId); return b; })(),
    ],
    PROGRAM_ID
  );
  return pda;
}

function encodeCreateTask(taskId: bigint, title: string, priority: number): Buffer {
  const disc = ixDiscriminator("create_task");
  const taskIdBuf = Buffer.alloc(8);
  taskIdBuf.writeBigUInt64LE(taskId);
  const titleBytes = Buffer.from(title, "utf-8");
  const titleLen = Buffer.alloc(4);
  titleLen.writeUInt32LE(titleBytes.length);
  const priorityBuf = Buffer.alloc(1);
  priorityBuf.writeUInt8(priority);
  return Buffer.concat([disc, taskIdBuf, titleLen, titleBytes, priorityBuf]);
}

function encodeUpdateStatus(taskId: bigint, status: number): Buffer {
  const disc = ixDiscriminator("update_status");
  const taskIdBuf = Buffer.alloc(8);
  taskIdBuf.writeBigUInt64LE(taskId);
  const statusBuf = Buffer.alloc(1);
  statusBuf.writeUInt8(status);
  return Buffer.concat([disc, taskIdBuf, statusBuf]);
}

async function createTask(taskId: bigint, title: string, priority: number): Promise<PublicKey> {
  const pda = taskPda(taskId);
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: encodeCreateTask(taskId, title, priority),
  });
  await sendAndConfirmTransaction(connection, new Transaction().add(ix), [payer]);
  return pda;
}

async function updateStatus(taskId: bigint, status: number): Promise<void> {
  const pda = taskPda(taskId);
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    data: encodeUpdateStatus(taskId, status),
  });
  await sendAndConfirmTransaction(connection, new Transaction().add(ix), [payer]);
}

// ── Demo tasks ────────────────────────────────────────────────────────────────
// status: 0=To Do, 1=In Progress, 2=Done

const DEMO_TASKS: { title: string; priority: number; status: number }[] = [
  { title: "Set up Anchor program",      priority: 3, status: 2 }, // Done
  { title: "Write curvhex ORM schema",   priority: 3, status: 2 }, // Done
  { title: "Build Next.js frontend",     priority: 2, status: 2 }, // Done
  { title: "Deploy program to devnet",   priority: 3, status: 1 }, // In Progress
  { title: "Integrate ORM with API",     priority: 2, status: 1 }, // In Progress
  { title: "Deploy to Vercel",           priority: 2, status: 0 }, // To Do
  { title: "Write tutorial README",      priority: 1, status: 0 }, // To Do
  { title: "Add unit tests",             priority: 1, status: 0 }, // To Do
];

const STATUS_LABELS: Record<number, string> = { 0: "To Do", 1: "In Progress", 2: "Done" };

async function main() {
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Payer:   ${payer.publicKey.toBase58()}`);
  console.log(`Balance: ${(balance / 1e9).toFixed(4)} SOL\n`);

  if (balance < 0.1 * 1e9) {
    console.error("Not enough SOL. Run: solana airdrop 2");
    process.exit(1);
  }

  for (let i = 0; i < DEMO_TASKS.length; i++) {
    const { title, priority, status } = DEMO_TASKS[i];
    const taskId = BigInt(i + 1);
    try {
      await createTask(taskId, title, priority);
      console.log(`✓ Created #${taskId}: "${title}"`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("already in use")) {
        console.log(`  Task #${taskId} already exists.`);
      } else {
        console.error(`✗ Task #${taskId} create failed:`, err);
        continue;
      }
    }

    if (status !== 0) {
      try {
        await updateStatus(taskId, status);
        console.log(`  → Status set to ${STATUS_LABELS[status]}`);
      } catch (err) {
        console.error(`✗ Task #${taskId} status update failed:`, err);
      }
    }
  }

  console.log("\nDone! Refresh the app to see tasks.");
}

main().catch(console.error);
