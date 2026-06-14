import { NextResponse } from "next/server";
import { getOrm } from "@/lib/orm";

// Cache GET responses for 10 seconds to avoid hitting RPC rate limits
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 10_000;
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

function ixDiscriminator(name: string): Buffer {
  return Buffer.from(
    createHash("sha256").update(`global:${name}`).digest().slice(0, 8)
  );
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

function getPayer(): Keypair {
  const walletPath = process.env.WALLET_PATH!;
  const raw = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  return Keypair.fromSecretKey(Buffer.from(raw));
}

// GET /api/tasks?status=0&owner=<pubkey>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const ownerParam = searchParams.get("owner");

  try {
    const orm = getOrm();

    const where: Record<string, unknown> = {};
    if (statusParam !== null) where.status = Number(statusParam);
    if (ownerParam) where.owner = ownerParam;

    // findMany — Prisma-style query over on-chain PDA accounts
    const tasks = await orm.models.task.findMany({ where });

    // Aggregate: total tasks, counts per status
    const stats = await orm.models.task.aggregate({
      _count: true,
      _sum: { taskId: true },
    });

    // Group tasks by status
    const byStatus = await orm.models.task.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        address: t.address,
        owner: t.owner,
        taskId: t.taskId.toString(),
        title: t.title,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt.toString(),
      })),
      stats: {
        total: stats._count,
        byStatus: byStatus.map((g) => ({
          status: g.status,
          count: g._count,
        })),
      },
    });
  } catch (err) {
    console.error("ORM query failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks from chain" },
      { status: 500 }
    );
  }
}

// POST /api/tasks  body: { title, priority }
export async function POST(request: Request) {
  try {
    const { title, priority } = await request.json();
    if (!title || typeof priority !== "number") {
      return NextResponse.json({ error: "title and priority required" }, { status: 400 });
    }

    const payer = getPayer();
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, "confirmed");

    // Use timestamp as unique task ID
    const taskId = BigInt(Date.now());

    const [taskPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("task"),
        payer.publicKey.toBuffer(),
        (() => { const b = Buffer.alloc(8); b.writeBigUInt64LE(taskId); return b; })(),
      ],
      PROGRAM_ID
    );

    const data = encodeCreateTask(taskId, title, priority);
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: taskPda, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);

    return NextResponse.json({ address: taskPda.toBase58(), signature: sig });
  } catch (err) {
    console.error("Create task failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create task" },
      { status: 500 }
    );
  }
}
