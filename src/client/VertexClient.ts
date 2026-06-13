import { PublicKey } from '@solana/web3.js';
import { ModelDefinition, InferModel } from '../core/types';
import { WhereClause } from '../core/filters';
import { QueryAdapter, FindManyOptions, AggregateOptions, GroupByOptions } from '../adapters/abstract/QueryAdapter';

export type { FindManyOptions };

export class VertexClient<M extends ModelDefinition> {
  constructor(
    private adapter: QueryAdapter,
    private model: M,
  ) { }

  async findMany(options: FindManyOptions<M> = {}): Promise<InferModel<M>[]> {
    return this.adapter.findMany(this.model, options);
  }

  async findFirst(options: { where?: WhereClause<M> } = {}): Promise<InferModel<M> | null> {
    const results = await this.adapter.findMany(this.model, { where: options.where ?? {}, take: 1 });
    return results[0] ?? null;
  }

  async findByAddress(address: string): Promise<InferModel<M> | null> {
    return this.adapter.findByAddress(this.model, address);
  }

  async findByPda(seeds: (Buffer | Uint8Array)[]): Promise<InferModel<M> | null> {
    return this.adapter.findByPda(this.model, seeds);
  }

  async count(where: WhereClause<M> = {}): Promise<number> {
    const results = await this.adapter.findMany(this.model, { where });
    return results.length;
  }

  async aggregate(options: AggregateOptions<M>): Promise<Record<string, any>> {
    const records = await this.adapter.findMany(this.model, { where: options.where ?? {} });
    return computeAggregate(records, options);
  }

  async groupBy(options: GroupByOptions<M>): Promise<Record<string, any>[]> {
    const records = await this.adapter.findMany(this.model, { where: options.where ?? {} });
    return computeGroupBy(records, options);
  }
}

function computeAggregate<M extends ModelDefinition>(
  records: InferModel<M>[],
  options: AggregateOptions<M>
): Record<string, any> {
  const result: Record<string, any> = {};

  if (options._count) result._count = records.length;

  for (const op of ['_sum', '_avg', '_min', '_max'] as const) {
    const fields = options[op];
    if (!fields) continue;
    result[op] = {};
    for (const [field, enabled] of Object.entries(fields)) {
      if (!enabled) continue;
      const values = records.map((r: any) => r[field]).filter((v: any) => v !== undefined);
      if (op === '_sum') result[op][field] = values.reduce((a: any, b: any) => a + b, 0n);
      else if (op === '_avg') result[op][field] = values.reduce((a: any, b: any) => a + b, 0n) / BigInt(values.length);
      else if (op === '_min') result[op][field] = values.reduce((a: any, b: any) => a < b ? a : b);
      else if (op === '_max') result[op][field] = values.reduce((a: any, b: any) => a > b ? a : b);
    }
  }

  return result;
}

function computeGroupBy<M extends ModelDefinition>(
  records: InferModel<M>[],
  options: GroupByOptions<M>
): Record<string, any>[] {
  const groups = new Map<string, InferModel<M>[]>();

  for (const record of records) {
    const key = options.by.map(f => String((record as any)[f])).join('::');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(record);
  }

  return Array.from(groups.entries()).map(([, groupRecords]) => {
    const result: Record<string, any> = {};

    for (const field of options.by) {
      result[field as string] = (groupRecords[0] as any)[field];
    }

    if (options._count) result._count = groupRecords.length;

    for (const op of ['_sum', '_avg', '_min', '_max'] as const) {
      const fields = options[op];
      if (!fields) continue;
      result[op] = {};
      for (const [field, enabled] of Object.entries(fields)) {
        if (!enabled) continue;
        const values = groupRecords.map((r: any) => r[field]).filter((v: any) => v !== undefined);
        if (op === '_sum') result[op][field] = values.reduce((a: any, b: any) => a + b, 0n);
        else if (op === '_avg') result[op][field] = values.reduce((a: any, b: any) => a + b, 0n) / BigInt(values.length);
        else if (op === '_min') result[op][field] = values.reduce((a: any, b: any) => a < b ? a : b);
        else if (op === '_max') result[op][field] = values.reduce((a: any, b: any) => a > b ? a : b);
      }
    }

    return result;
  });
}