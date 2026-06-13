import { defineModel } from '../core/schema';
import { buildFilters, applyClientFilters } from '../core/filters';

const UserAccount = defineModel({
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8],
    fields: {
        authority: { type: 'publicKey' },
        balance: { type: 'u64' },
        isActive: { type: 'bool' },
        tier: { type: 'u8' },
    }
});

const { rpcFilters, clientFilters } = buildFilters(UserAccount, {
    isActive: true,
    balance: { gte: 100n, lte: 10000n, } // → client-side
});

console.log('RPC Filters (on-chain):', JSON.stringify(rpcFilters, null, 2));
console.log('\nClient Filters:', clientFilters.map(f => f.fieldName));

const fakeResults = [
    { address: 'addr1', balance: 50n, isActive: true, tier: 1 },
    { address: 'addr2', balance: 500n, isActive: true, tier: 2 },
    { address: 'addr3', balance: 15000n, isActive: true, tier: 3 },
    { address: 'addr4', balance: 200n, isActive: false, tier: 1 },
];

const filtered = applyClientFilters(fakeResults, clientFilters);
console.log('\nClient filter sonrası:', filtered.map(r => ({ address: r.address, balance: r.balance })));