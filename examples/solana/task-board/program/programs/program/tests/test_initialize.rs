use {
    anchor_lang::{solana_program::instruction::Instruction, InstructionData, ToAccountMetas},
    litesvm::LiteSVM,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_keypair::Keypair,
    solana_transaction::versioned::VersionedTransaction,
    anchor_lang::solana_program::system_program,
};

fn build_svm() -> (LiteSVM, Keypair) {
    let payer = Keypair::new();
    let mut svm = LiteSVM::new();
    let bytes = include_bytes!("../../../target/deploy/program.so");
    svm.add_program(program::id(), bytes).unwrap();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    (svm, payer)
}

fn task_pda(owner: &anchor_lang::solana_program::pubkey::Pubkey, task_id: u64) -> anchor_lang::solana_program::pubkey::Pubkey {
    anchor_lang::solana_program::pubkey::Pubkey::find_program_address(
        &[b"task", owner.as_ref(), &task_id.to_le_bytes()],
        &program::id(),
    )
    .0
}

#[test]
fn test_create_task() {
    let (mut svm, payer) = build_svm();
    let task_id: u64 = 1;
    let pda = task_pda(&payer.pubkey(), task_id);

    let ix_data = program::instruction::CreateTask {
        task_id,
        title: "Write the ORM schema".to_string(),
        priority: 3,
    }
    .data();

    let accounts = program::accounts::CreateTask {
        task: pda,
        owner: payer.pubkey(),
        system_program: system_program::id(),
    }
    .to_account_metas(None);

    let ix = Instruction::new_with_bytes(program::id(), &ix_data, accounts);
    let bh = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &bh);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok(), "create_task failed: {:?}", res.err());
}

#[test]
fn test_update_status() {
    let (mut svm, payer) = build_svm();
    let task_id: u64 = 2;
    let pda = task_pda(&payer.pubkey(), task_id);

    // 1) create
    let create_data = program::instruction::CreateTask {
        task_id,
        title: "Deploy to Vercel".to_string(),
        priority: 2,
    }
    .data();
    let create_accounts = program::accounts::CreateTask {
        task: pda,
        owner: payer.pubkey(),
        system_program: system_program::id(),
    }
    .to_account_metas(None);
    let bh = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(
        &[Instruction::new_with_bytes(program::id(), &create_data, create_accounts)],
        Some(&payer.pubkey()),
        &bh,
    );
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();
    svm.send_transaction(tx).expect("create failed");

    // 2) update status → In Progress
    let update_data = program::instruction::UpdateStatus {
        _task_id: task_id,
        status: 1,
    }
    .data();
    let update_accounts = program::accounts::UpdateStatus {
        task: pda,
        owner: payer.pubkey(),
    }
    .to_account_metas(None);
    let bh = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(
        &[Instruction::new_with_bytes(program::id(), &update_data, update_accounts)],
        Some(&payer.pubkey()),
        &bh,
    );
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();
    let res = svm.send_transaction(tx);
    assert!(res.is_ok(), "update_status failed: {:?}", res.err());
}

#[test]
fn test_invalid_priority_rejected() {
    let (mut svm, payer) = build_svm();
    let task_id: u64 = 3;
    let pda = task_pda(&payer.pubkey(), task_id);

    let ix_data = program::instruction::CreateTask {
        task_id,
        title: "Bad priority".to_string(),
        priority: 5, // invalid — must be 1-3
    }
    .data();
    let accounts = program::accounts::CreateTask {
        task: pda,
        owner: payer.pubkey(),
        system_program: system_program::id(),
    }
    .to_account_metas(None);
    let bh = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(
        &[Instruction::new_with_bytes(program::id(), &ix_data, accounts)],
        Some(&payer.pubkey()),
        &bh,
    );
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();
    assert!(svm.send_transaction(tx).is_err(), "expected rejection for invalid priority");
}
