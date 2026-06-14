pub mod constants;
pub mod error;
pub mod state;

use anchor_lang::prelude::*;
use constants::*;
use error::TaskError;
use state::Task;

declare_id!("5HQnXHWAYCUemUis9Ka2Db8JwFkLwDefocq3Tfv9oRHd");

// ─── Instructions ─────────────────────────────────────────────────────────────

#[program]
pub mod task_board {
    use super::*;

    /// Create a new Task PDA for the signer.
    ///
    /// `task_id`  — client-chosen monotonic ID (used as a PDA seed)
    /// `title`    — max 64 bytes
    /// `priority` — 1=Low, 2=Medium, 3=High
    pub fn create_task(
        ctx: Context<CreateTask>,
        task_id: u64,
        title: String,
        priority: u8,
    ) -> Result<()> {
        require!(title.len() <= MAX_TITLE_LEN, TaskError::TitleTooLong);
        require!(
            priority >= PRIORITY_LOW && priority <= PRIORITY_HIGH,
            TaskError::InvalidPriority
        );

        let task = &mut ctx.accounts.task;
        task.owner = ctx.accounts.owner.key();
        task.task_id = task_id;
        task.title = title;
        task.priority = priority;
        task.status = STATUS_TODO;
        task.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// Change the status of an existing Task.
    ///
    /// `task_id` — must match the one used at creation (PDA seed)
    /// `status`  — 0=To Do, 1=In Progress, 2=Done
    pub fn update_status(
        ctx: Context<UpdateStatus>,
        _task_id: u64,
        status: u8,
    ) -> Result<()> {
        require!(status <= STATUS_DONE, TaskError::InvalidStatus);
        ctx.accounts.task.status = status;
        Ok(())
    }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct CreateTask<'info> {
    /// The new Task PDA — seeded by [TASK_SEED, owner, task_id_le_bytes].
    /// Anchor creates the account and charges rent to `owner`.
    #[account(
        init,
        payer = owner,
        space = Task::LEN,
        seeds = [TASK_SEED, owner.key().as_ref(), &task_id.to_le_bytes()],
        bump,
    )]
    pub task: Account<'info, Task>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct UpdateStatus<'info> {
    /// The existing Task PDA — validated against `owner` via has_one.
    #[account(
        mut,
        seeds = [TASK_SEED, owner.key().as_ref(), &task_id.to_le_bytes()],
        bump,
        has_one = owner,
    )]
    pub task: Account<'info, Task>,

    pub owner: Signer<'info>,
}
