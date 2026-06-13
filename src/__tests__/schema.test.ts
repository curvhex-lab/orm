import { defineModel } from '../core/schema';

const UserAccount = defineModel({
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8],
    fields: {
        authority: { type: 'publicKey' },   // offset: 8  (disc=8 byte)
        balance: { type: 'u64' },           // offset: 40 (8+32)
        isActive: { type: 'bool' },         // offset: 48 (8+32+8)
        tier: { type: 'u8' },               // offset: 49 (8+32+8+1)
    }
});

console.log(JSON.stringify(UserAccount, null, 2));