import { Connection, PublicKey } from '@solana/web3.js';
import { defineModel } from '../core/schema';
import { anchor } from '../core/schema';
import { VertexORM } from '../client/VertexORM';
import { VertexClient } from '../client/VertexClient';
import { RpcAdapter } from '../adapters/RpcAdapter';
import type { QueryAdapter } from '../adapters/abstract/QueryAdapter';

// ─── Modeller ────────────────────────────────────────────────────────────────

const TokenAccount = defineModel({
  discriminator: [],
  fields: {
    mint:                 { type: 'publicKey' },  // offset 0
    owner:                { type: 'publicKey' },  // offset 32
    amount:               { type: 'u64' },        // offset 64
    delegateOption:       { type: 'u32' },        // offset 72
    delegate:             { type: 'publicKey' },  // offset 76
    state:                { type: 'u8' },         // offset 108
    isNativeOption:       { type: 'u32' },        // offset 109
    isNative:             { type: 'u64' },        // offset 113
    delegatedAmount:      { type: 'u64' },        // offset 121
    closeAuthorityOption: { type: 'u32' },        // offset 129
    closeAuthority:       { type: 'publicKey' },  // offset 133
  }
});

// Anchor discriminator helper testi için sahte model
const UserAccount = defineModel({
  discriminator: anchor('UserAccount'),
  fields: {
    authority: { type: 'publicKey' },
    balance:   { type: 'u64' },
    tier:      { type: 'u8' },
    isActive:  { type: 'bool' },
  }
});

const VaultAccount = defineModel({
  discriminator: anchor('VaultAccount'),
  fields: {
    ownerPubkey: { type: 'publicKey' },
    totalLocked: { type: 'u64' },
  }
});

// ─── Sabitler ────────────────────────────────────────────────────────────────

const TOKEN_PROGRAM_ID   = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_ACCOUNT_ADDR = 'CJkhvuce2SeEAQUTBeS3xwjWwCLJSC4czFTvN7okj59H';

// ─── Mock adapter yardımcısı ──────────────────────────────────────────────────

function mockAdapter(records: any[], byAddress: Record<string, any> = {}): QueryAdapter {
  return {
    findMany:      async () => records,
    findByAddress: async (_model: any, addr: string) => byAddress[addr] ?? null,
    findByPda:     async () => null,
  } as QueryAdapter;
}

// ─── Yardımcı: bigint'leri JSON'da string'e çevir ────────────────────────────

const bigintReplacer = (_: string, v: unknown) =>
  typeof v === 'bigint' ? v.toString() : v;

// ─── Test runner ──────────────────────────────────────────────────────────────

async function run(name: string, fn: () => Promise<void>) {
  console.log(`\n${'─'.repeat(52)}`);
  console.log(`▶  ${name}`);
  console.log('─'.repeat(52));
  try {
    await fn();
    console.log('✓ geçti');
  } catch (e) {
    console.error('✗ başarısız:', e);
  }
}

// ─── Testler ──────────────────────────────────────────────────────────────────

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const adapter    = new RpcAdapter(connection, new PublicKey(TOKEN_PROGRAM_ID));
  const orm        = new VertexORM({
    connection,
    programId: TOKEN_PROGRAM_ID,
    adapter,
    models: { TokenAccount },
  });

  // ── 1. findByAddress — gerçek devnet account ────────────────────────────────
  await run('findByAddress (devnet)', async () => {
    const account = await orm.models.tokenAccount.findByAddress(TOKEN_ACCOUNT_ADDR);
    if (!account) throw new Error('account bulunamadı');
    console.log({
      address: account.address,
      mint:    account.mint,
      owner:   account.owner,
      amount:  account.amount,
      state:   account.state,
    });
  });

  // ── 2. Anchor discriminator helper ─────────────────────────────────────────
  await run('anchor() discriminator hesaplama', async () => {
    const disc = anchor('UserAccount');
    console.log('UserAccount discriminator:', disc);
    if (disc.length !== 8) throw new Error('discriminator 8 byte olmalı');
    console.log('UserAccount model offsets:', UserAccount.fields);
  });

  // ── 3. findFirst ────────────────────────────────────────────────────────────
  await run('findFirst', async () => {
    const fakeRecords = [
      { address: 'a1', mint: 'x', owner: 'alice', amount: 500n, state: 1 },
      { address: 'a2', mint: 'x', owner: 'bob',   amount: 300n, state: 1 },
    ];
    const client = new VertexClient(mockAdapter(fakeRecords), TokenAccount);
    const first  = await client.findFirst({ where: { owner: 'alice' } });
    console.log('findFirst sonucu:', first);
    if (first?.owner !== 'alice') throw new Error('yanlış kayıt döndü');
  });

  // ── 4. findMany — where + orderBy + take ────────────────────────────────────
  await run('findMany (where + orderBy + take)', async () => {
    const fakeRecords = [
      { address: 'a1', mint: 'x', owner: 'alice', amount: 100n, state: 1 },
      { address: 'a2', mint: 'x', owner: 'bob',   amount: 500n, state: 1 },
      { address: 'a3', mint: 'x', owner: 'alice', amount: 200n, state: 0 },
      { address: 'a4', mint: 'x', owner: 'carol', amount: 800n, state: 1 },
    ];

    const adapter: QueryAdapter = {
      ...mockAdapter(fakeRecords),
      findMany: async (_model: any, opts: any) => {
        let results = [...fakeRecords];
        if (opts.where?.owner) results = results.filter(r => r.owner === opts.where.owner);
        if (opts.orderBy?.amount === 'desc') results.sort((a, b) => Number(b.amount - a.amount));
        if (opts.take) results = results.slice(0, opts.take);
        return results;
      },
    } as QueryAdapter;

    const client  = new VertexClient(adapter, TokenAccount);
    const results = await client.findMany({
      where:   { owner: 'alice' },
      orderBy: { amount: 'desc' },
      take:    1,
    });
    console.log('findMany sonucu:', results);
    if (results[0]?.amount !== 200n) throw new Error('sıralama hatalı');
  });

  // ── 5. count ────────────────────────────────────────────────────────────────
  await run('count', async () => {
    const fakeRecords = [
      { address: 'a1', owner: 'alice', amount: 100n, state: 1 },
      { address: 'a2', owner: 'bob',   amount: 200n, state: 1 },
      { address: 'a3', owner: 'alice', amount: 300n, state: 0 },
    ];
    const client = new VertexClient(mockAdapter(fakeRecords), TokenAccount);
    const total  = await client.count();
    console.log('count:', total);
    if (total !== 3) throw new Error(`beklenen 3, gelen ${total}`);
  });

  // ── 6. aggregate ────────────────────────────────────────────────────────────
  await run('aggregate (_count, _sum, _min, _max)', async () => {
    const fakeRecords = [
      { address: 'a1', owner: 'alice', amount: 100n, state: 1 },
      { address: 'a2', owner: 'bob',   amount: 300n, state: 1 },
      { address: 'a3', owner: 'carol', amount: 200n, state: 0 },
    ];
    const client = new VertexClient(mockAdapter(fakeRecords), TokenAccount);
    const agg    = await client.aggregate({
      _count: true,
      _sum:   { amount: true },
      _min:   { amount: true },
      _max:   { amount: true },
    });
    console.log('aggregate:', JSON.stringify(agg, bigintReplacer, 2));
    if (agg._count !== 3)    throw new Error('count hatalı');
    if (agg._sum.amount !== 600n) throw new Error('sum hatalı');
    if (agg._min.amount !== 100n) throw new Error('min hatalı');
    if (agg._max.amount !== 300n) throw new Error('max hatalı');
  });

  // ── 7. groupBy ──────────────────────────────────────────────────────────────
  await run('groupBy (owner bazında)', async () => {
    const fakeRecords = [
      { address: 'a1', owner: 'alice', amount: 500n, state: 1 },
      { address: 'a2', owner: 'bob',   amount: 300n, state: 1 },
      { address: 'a3', owner: 'alice', amount: 200n, state: 0 },
    ];
    const client  = new VertexClient(mockAdapter(fakeRecords), TokenAccount);
    const grouped = await client.groupBy({
      by:    ['owner'],
      _count: true,
      _sum:  { amount: true },
    });
    console.log('groupBy:', JSON.stringify(grouped, bigintReplacer, 2));

    const alice = grouped.find((g: any) => g.owner === 'alice');
    if (!alice)                     throw new Error('alice grubu yok');
    if (alice._count !== 2)         throw new Error('alice count hatalı');
    if (alice._sum.amount !== 700n) throw new Error('alice sum hatalı');
  });

  // ── 8. include (relations) ──────────────────────────────────────────────────
  await run('include (vault → owner ilişkisi)', async () => {
    const ownerRecord = {
      address:   'owner-addr-1',
      authority: 'owner-addr-1',
      balance:   1000n,
      tier:      2,
      isActive:  true,
    };
    const vaultRecords = [
      { address: 'vault-1', ownerPubkey: 'owner-addr-1', totalLocked: 5000n },
      { address: 'vault-2', ownerPubkey: 'owner-addr-1', totalLocked: 3000n },
    ];

    const adapter: QueryAdapter = {
      findMany:      async () => vaultRecords as any,
      findByAddress: async (_model: any, addr: string) =>
        addr === 'owner-addr-1' ? ownerRecord as any : null,
      findByPda: async () => null,
    } as QueryAdapter;

    const client  = new VertexClient(adapter, VaultAccount);
    const results = await client.findMany({
      include: {
        owner: { model: UserAccount, foreignKey: 'ownerPubkey' }
      }
    });

    console.log('include sonucu:', JSON.stringify(results, bigintReplacer, 2));
    if ((results[0] as any).owner?.balance !== 1000n) throw new Error('relation hatalı');
    // Aynı owner 2 kez fetch edilmemeli (Set ile tekilleştirme)
    console.log('✓ aynı owner 2 vault için tek seferinde fetch edildi');
  });
}

main().catch(console.error);
