use anchor_lang::prelude::*;

#[error_code]
pub enum TaskError {
    #[msg("Title must be 64 characters or less")]
    TitleTooLong,

    #[msg("Priority must be 1 (Low), 2 (Medium), or 3 (High)")]
    InvalidPriority,

    #[msg("Status must be 0 (To Do), 1 (In Progress), or 2 (Done)")]
    InvalidStatus,
}
