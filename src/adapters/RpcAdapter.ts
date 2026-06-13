import { Connection, PublicKey, GetProgramAccountsFilter } from '@solana/web3.js';
import { ModelDefinition, InferModel } from '../core/types';
import { buildFilters, applyClientFilters } from '../core/filters';
import { deserialize } from '../core/deserializer';
import { QueryAdapter, FindManyOptions } from './abstract/QueryAdapter';

export class RpcAdapter implements QueryAdapter {
    constructor(
        private connection: Connection,
        private programId: PublicKey,
    ) { }

    async findMany<M extends ModelDefinition>(
        model: M,
        options: FindManyOptions<M> = {}
    ): Promise<InferModel<M>[]> {
        const { where = {}, orderBy, take, skip = 0, dataSize } = options;
        const { rpcFilters, clientFilters } = buildFilters(model, where);

        const rpcParams: GetProgramAccountsFilter[] = rpcFilters.map(f => {
            if ('memcmp' in f) {
                return { memcmp: { offset: f.memcmp.offset, bytes: f.memcmp.bytes, encoding: 'base64' as const } };
            }
            return { dataSize: (f as any).dataSize };
        });

        if (dataSize) rpcParams.push({ dataSize });

        const accounts = await this.connection.getProgramAccounts(this.programId, {
            filters: rpcParams,
        });

        let results = accounts.map(({ pubkey, account }) =>
            deserialize(model, account.data as Buffer, pubkey.toBase58())
        );

        if (clientFilters.length > 0) {
            results = applyClientFilters(results, clientFilters);
        }

        if (orderBy) {
            const entry = Object.entries(orderBy)[0];
            if (entry) {
                const [field, direction] = entry;
                results.sort((a, b) => {
                    const aVal = a[field];
                    const bVal = b[field];
                    if (aVal === undefined || bVal === undefined) return 0;
                    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }
        }

        return results.slice(skip, take !== undefined ? skip + take : undefined);
    }

    async findByAddress<M extends ModelDefinition>(
        model: M,
        address: string
    ): Promise<InferModel<M> | null> {
        const pubkey = new PublicKey(address);
        const accountInfo = await this.connection.getAccountInfo(pubkey);
        if (!accountInfo) return null;
        return deserialize(model, accountInfo.data as Buffer, address);
    }

    async findByPda<M extends ModelDefinition>(
        model: M,
        seeds: (Buffer | Uint8Array)[]
    ): Promise<InferModel<M> | null> {
        const [pda] = PublicKey.findProgramAddressSync(seeds, this.programId);
        const accountInfo = await this.connection.getAccountInfo(pda);
        if (!accountInfo) return null;
        return deserialize(model, accountInfo.data as Buffer, pda.toBase58());
    }    
}