use anchor_lang::prelude::*;

/// On-chain task stored as a PDA.
///
/// Seeds: ["task", owner, task_id_le_bytes]
/// Space: Task::LEN bytes
#[account]
pub struct Task {
    /// Wallet that created and owns this task.
    pub owner: Pubkey,
    /// Monotonically-increasing ID chosen by the client (used in PDA seeds).
    pub task_id: u64,
    /// Short description — max 64 UTF-8 bytes.
    pub title: String,
    /// 1 = Low, 2 = Medium, 3 = High
    pub priority: u8,
    /// 0 = To Do, 1 = In Progress, 2 = Done
    pub status: u8,
    /// Unix timestamp (seconds) set at creation.
    pub created_at: i64,
}

impl Task {
    /// Byte layout:
    /// 8  discriminator
    /// 32 owner
    /// 8  task_id
    /// 4  title (length prefix) + 64 payload
    /// 1  priority
    /// 1  status
    /// 8  created_at
    pub const LEN: usize = 8 + 32 + 8 + (4 + 64) + 1 + 1 + 8;
}
