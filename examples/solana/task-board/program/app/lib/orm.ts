import { Connection } from "@solana/web3.js";
import { CurvhexORM, defineModel, anchor } from "@curvhex/orm";

// The program ID deployed on devnet
export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID!;

// Define the Task account schema — mirrors the Anchor struct exactly.
//
// Anchor account layout (after 8-byte discriminator):
//   owner:      publicKey  (32 bytes)
//   task_id:    u64        (8 bytes)
//   title:      string     (4-byte length prefix + up to 64 bytes)
//   priority:   u8         (1 byte)  — 1=low, 2=medium, 3=high
//   status:     u8         (1 byte)  — 0=todo, 1=in_progress, 2=done
//   created_at: i64        (8 bytes)
export const TaskModel = defineModel({
  discriminator: anchor("Task"),
  fields: {
    owner:      { type: "publicKey" },
    taskId:     { type: "u64" },
    title:      { type: "string", maxLen: 64 },
    priority:   { type: "u8" },
    status:     { type: "u8" },
    createdAt:  { type: "i64" },
  },
});

function createOrm() {
  const rpc = process.env.NEXT_PUBLIC_RPC_URL!;
  const connection = new Connection(rpc, "confirmed");

  return new CurvhexORM({
    connection,
    programId: PROGRAM_ID,
    models: { Task: TaskModel },
  });
}

// Singleton — one ORM instance per process.
let _orm: ReturnType<typeof createOrm> | null = null;

export function getOrm() {
  if (!_orm) _orm = createOrm();
  return _orm;
}

// Human-readable labels
export const STATUS_LABELS: Record<number, string> = {
  0: "To Do",
  1: "In Progress",
  2: "Done",
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};
