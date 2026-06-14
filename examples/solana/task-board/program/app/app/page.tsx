"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Task {
  address: string;
  owner: string;
  taskId: string;
  title: string;
  priority: number;
  status: number;
  createdAt: string;
}

interface StatusStat {
  status: number;
  count: number;
}

interface ApiResponse {
  tasks: Task[];
  stats: { total: number; byStatus: StatusStat[] };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<number, string> = {
  0: "To Do",
  1: "In Progress",
  2: "Done",
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

const STATUS_COLORS: Record<number, string> = {
  0: "bg-slate-100 text-slate-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-600",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-red-100 text-red-700",
};

// ── Components ────────────────────────────────────────────────────────────────

function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const date = new Date(Number(task.createdAt) * 1000).toLocaleDateString();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
        <div className="flex shrink-0 gap-1.5">
          <Badge className={PRIORITY_COLORS[task.priority]}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <Badge className={STATUS_COLORS[task.status]}>
            {STATUS_LABELS[task.status]}
          </Badge>
        </div>
      </div>
      <p className="mt-2 font-mono text-xs text-gray-400 break-all">
        {task.address}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Owner: {task.owner.slice(0, 8)}…{task.owner.slice(-4)}
      </p>
      <p className="mt-1 text-xs text-gray-400">Status raw: {task.status}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        filter === "all" ? "/api/tasks" : `/api/tasks?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const statByStatus = (s: number) =>
    data?.stats.byStatus.find((b) => b.status === s)?.count ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white text-lg font-bold">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Solana Task Board
              </h1>
              <p className="text-xs text-gray-500">
                On-chain tasks queried with{" "}
                <span className="font-medium text-violet-600">
                  @curvhex/orm
                </span>{" "}
                · Devnet
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Code snippet — tutorial section */}
        <section className="rounded-xl border border-violet-200 bg-violet-50 p-5">
          <p className="mb-2 text-sm font-semibold text-violet-800">
            How it works — query on-chain PDAs with @curvhex/orm
          </p>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-green-300 leading-relaxed">
            {`// 1. Define your Anchor account schema
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

// 2. Create the ORM (works with any RPC endpoint)
const orm = new CurvhexORM({
  connection: new Connection("https://api.devnet.solana.com"),
  programId: PROGRAM_ID,
  models: { Task: TaskModel },
});

// 3. Query like Prisma — no manual memcmp byte math
const tasks = await orm.models.task.findMany({
  where: { status: 1 },        // filter in_progress tasks
});

// Aggregate across all accounts
const stats = await orm.models.task.aggregate({
  _count: true,
  _sum:   { taskId: true },
});

// Group by field
const byStatus = await orm.models.task.groupBy({
  by: ["status"],
  _count: true,
});`}
          </pre>
        </section>

        {/* Stats */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            On-chain stats
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Tasks" value={data?.stats.total ?? 0} />
            <StatCard label="To Do" value={statByStatus(0)} />
            <StatCard label="In Progress" value={statByStatus(1)} />
            <StatCard label="Done" value={statByStatus(2)} />
          </div>
        </section>

        {/* Filter + refresh */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[
                ["all", "All"],
                ["0", "To Do"],
                ["1", "In Progress"],
                ["2", "Done"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    filter === val
                      ? "bg-violet-600 text-white shadow"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchTasks}
              disabled={loading}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>
        </section>

        {/* Task list */}
        <section>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && data?.tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-gray-500">No tasks found on-chain yet.</p>
              <p className="mt-1 text-sm text-gray-400">
                Run the seed script to create some demo tasks on devnet.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {data?.tasks.map((task) => (
              <TaskCard key={task.address} task={task} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p>
            Solana Task Board · Built with{" "}
            <a
              href="https://github.com/curvhex/orm"
              className="text-violet-600 hover:underline"
            >
              @curvhex/orm
            </a>{" "}
            · Anchor · Next.js · Devnet
          </p>
        </footer>
      </main>
    </div>
  );
}
