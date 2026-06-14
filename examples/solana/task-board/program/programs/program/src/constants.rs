/// PDA seed prefix for Task accounts.
pub const TASK_SEED: &[u8] = b"task";

/// Maximum byte length of a task title.
pub const MAX_TITLE_LEN: usize = 64;

pub const PRIORITY_LOW: u8 = 1;
pub const PRIORITY_MEDIUM: u8 = 2;
pub const PRIORITY_HIGH: u8 = 3;

pub const STATUS_TODO: u8 = 0;
pub const STATUS_IN_PROGRESS: u8 = 1;
pub const STATUS_DONE: u8 = 2;
