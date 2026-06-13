import { Connection, PublicKey, GetProgramAccountsFilter } from '@solana/web3.js';
import { ModelDefinition, InferModel } from '../core/types';
import { WhereClause, buildFilters, applyClientFilters } from '../core/filters';
import { deserialize } from '../core/deserializer';

export interface FindManyOptions<M extends ModelDefinition> {
  where?: WhereClause<M>;
  orderBy?: { [K in keyof M['fields']]?: 'asc' | 'desc'};
  take?: number;
  skip?: number;
}

export interface FindFirstOptions<M extends ModelDefinition> {
  where?: WhereClause<M>;
}

export class ModelClient<M extends ModelDefinition> {
  constructor(
    private connection: Connection,
    private programId: PublicKey,
    private model: M,
  ) { }

  async findMany(options: FindManyOptions<M> = {}): Promise<InferModel<M>[]> {
    const { where = {}, orderBy, take, skip = 0 } = options;

    const { rpcFilters, clientFilters } = buildFilters(this.model, where);

    const rpcParams: GetProgramAccountsFilter[] = rpcFilters.map(f => {
      if ('memcmp' in f) {
        return {
          memcmp: {
            offset: f.memcmp.offset,
            bytes: f.memcmp.bytes,
            encoding: 'base64' as const,
          }
        };
      }
      return { dataSize: (f as any).dataSize };
    });

    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: rpcParams,
    });

    let results = accounts.map(({ pubkey, account }) =>
      deserialize(this.model, account.data as Buffer, pubkey.toBase58())
    );

    if (clientFilters.length > 0) {
      results = applyClientFilters(results, clientFilters);
    }

    // Sıralama
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

    // Pagination
    const paginated = results.slice(skip, take !== undefined ? skip + take : undefined);

    return paginated;
  }

  async findFirst(options: FindFirstOptions<M> = {}): Promise<InferModel<M> | null> {
    const results = await this.findMany({ where: options.where ?? {}, take: 1 });
    return results[0] ?? null;
  }

  async findByPda(seeds: (Buffer | Uint8Array)[]): Promise<InferModel<M> | null> {
    const [pda] = PublicKey.findProgramAddressSync(seeds, this.programId);

    const accountInfo = await this.connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    return deserialize(this.model, accountInfo.data as Buffer, pda.toBase58());
  }

  async count(where: WhereClause<M> = {}): Promise<number> {
    const results = await this.findMany({ where });
    return results.length;
  }

  async aggregate(options: {
    where?: WhereClause<M>;
    _count?: boolean;
    _sum?: { [K in keyof M['fields']]?: boolean };
    _avg?: { [K in keyof M['fields']]?: boolean };
    _min?: { [K in keyof M['fields']]?: boolean };
    _max?: { [K in keyof M['fields']]?: boolean };
  }) {
    const records = await this.findMany({ where: options.where ?? {} });

    const result: Record<string, any> = {};

    if (options._count) {
      result._count = records.length;
    }

    for (const op of ['_sum', '_avg', '_min', '_max'] as const) {
      const fields = options[op];
      if (!fields) continue;

      result[op] = {};
      for (const [field, enabled] of Object.entries(fields)) {
        if (!enabled) continue;

        const values = records.map(r => r[field]).filter(v => v !== undefined);

        if (op === '_sum') {
          result[op][field] = values.reduce((a: any, b: any) => a + b, 0n);
        } else if (op === '_avg') {
          const sum = values.reduce((a: any, b: any) => a + b, 0n);
          result[op][field] = sum / BigInt(values.length);
        } else if (op === '_min') {
          result[op][field] = values.reduce((a: any, b: any) => a < b ? a : b);
        } else if (op === '_max') {
          result[op][field] = values.reduce((a: any, b: any) => a > b ? a : b);
        }
      }
    }

    return result;
  }
}