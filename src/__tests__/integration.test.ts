import { Connection, PublicKey } from '@solana/web3.js';
import { defineModel } from '../core/schema';
import { VertexClient } from '../client/VertexClient';

// SPL Token Account şeması (165 byte, sabit yapı)
const TokenAccount = defineModel({
    discriminator: [],  // SPL Token native program — discriminator yok
    fields: {
        mint: { type: 'publicKey' },  // offset 0:  hangi token
        owner: { type: 'publicKey' },  // offset 32: kim sahip
        amount: { type: 'u64' },        // offset 64: bakiye
        delegateOption: { type: 'u32' },        // offset 72: 0=None, 1=Some
        delegate: { type: 'publicKey' },  // offset 76
        state: { type: 'u8' },         // offset 108: 1=initialized
        isNativeOption: { type: 'u32' },        // offset 109
        isNative: { type: 'u64' },        // offset 113
        delegatedAmount: { type: 'u64' },        // offset 121
        closeAuthorityOption: { type: 'u32' },     // offset 129
        closeAuthority: { type: 'publicKey' },  // offset 133
    }
});

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
    const TOKEN_ACCOUNT_ADDRESS = 'CJkhvuce2SeEAQUTBeS3xwjWwCLJSC4czFTvN7okj59H';

    const client = new VertexClient(connection, TOKEN_PROGRAM_ID, TokenAccount);

    console.log('Token account okunuyor...');

    const account = await client.findByAddress(TOKEN_ACCOUNT_ADDRESS);

    console.log('Sonuç:', {
        address: account?.address,
        mint: account?.mint,
        owner: account?.owner,
        amount: account?.amount,
        state: account?.state,
    });
}

main().catch(console.error);