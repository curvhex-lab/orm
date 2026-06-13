import { defineModel } from './schema';
import { deserialize } from './deserializer';

const UserAccount = defineModel({
    discriminator: [1, 2, 3, 4, 5, 6, 7, 8],
    fields: {
        authority: { type: 'publicKey' },
        balance: { type: 'u64' },
        isActive: { type: 'bool' },
        tier: { type: 'u8' },
    }
});

// Sahte account data'sı oluştur
const fakeData = Buffer.alloc(58);

// discriminator (8 byte)
Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]).copy(fakeData, 0);

// authority: 32 byte — hepsi 0x01 (basit test adresi)
fakeData.fill(1, 8, 40);

// balance: 1000n (u64 LE)
fakeData.writeBigUInt64LE(1000n, 40);

// isActive: true
fakeData.writeUInt8(1, 48);

// tier: 2
fakeData.writeUInt8(2, 49);

const result = deserialize(UserAccount, fakeData, 'testAddress123');
console.log(result);
// Beklenen:
// {
//   address: 'testAddress123',
//   authority: '4vJ9JU...',   ← 32 byte 0x01'in base58 karşılığı
//   balance: 1000n,
//   isActive: true,
//   tier: 2
// }