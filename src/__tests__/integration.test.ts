import { Connection, PublicKey } from '@solana/web3.js';
import { defineModel } from '../core/schema';
import { VertexORM } from '../client/VertexORM';
import { RpcAdapter } from '../adapters/RpcAdapter';

const TokenAccount = defineModel({
    discriminator: [],
    fields: {
        mint: { type: 'publicKey' },  // offset 0
        owner: { type: 'publicKey' },  // offset 32
        amount: { type: 'u64' },        // offset 64
        delegateOption: { type: 'u32' },        // offset 72
        delegate: { type: 'publicKey' },  // offset 76
        state: { type: 'u8' },         // offset 108
        isNativeOption: { type: 'u32' },        // offset 109
        isNative: { type: 'u64' },        // offset 113
        delegatedAmount: { type: 'u64' },        // offset 121
        closeAuthorityOption: { type: 'u32' },        // offset 129
        closeAuthority: { type: 'publicKey' },  // offset 133
    }
});

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_ACCOUNT_ADDR = 'CJkhvuce2SeEAQUTBeS3xwjWwCLJSC4czFTvN7okj59H';

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // RpcAdapter'ı açıkça geçiyoruz — ileride HeliusAdapter veya PostgresAdapter ile değişecek
    const adapter = new RpcAdapter(connection, new PublicKey(TOKEN_PROGRAM_ID));

    const orm = new VertexORM({
        connection,
        programId: TOKEN_PROGRAM_ID,
        adapter,
        models: { TokenAccount },
    });

    console.log('─── findByAddress ───────────────────────────────');
    const account = await orm.models.tokenAccount.findByAddress(TOKEN_ACCOUNT_ADDR);
    console.log({
        address: account?.address,
        mint: account?.mint,
        owner: account?.owner,
        amount: account?.amount,
        state: account?.state,
    });

    console.log('\n─── aggregate ───────────────────────────────────');
    // Tek account üzerinde aggregate — adapter pattern çalışıyor mu doğrula
    const fakeRecords = [
        { address: 'a1', mint: 'x', owner: 'y', amount: 500n, state: 1 },
        { address: 'a2', mint: 'x', owner: 'z', amount: 300n, state: 1 },
        { address: 'a3', mint: 'x', owner: 'y', amount: 200n, state: 0 },
    ];

    console.log('\n─── groupBy (owner bazında) ─────────────────────');
    const { VertexClient } = await import('../client/VertexClient.js');

    const mockAdapter = {
        findMany: async () => fakeRecords as any,
        findByAddress: async () => null,
        findByPda: async () => null,
    };

    const mockClient = new VertexClient(mockAdapter, TokenAccount);

    const grouped = await mockClient.groupBy({
        by: ['owner'],
        _count: true,
        _sum: { amount: true },
    });

    console.log('groupBy sonucu:', JSON.stringify(grouped, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v, 2
    ));
}

main().catch(console.error);
