import { ModelDefinition, InferModel } from '../../core/types';
import { WhereClause } from '../../core/filters';

export interface FindManyOptions<M extends ModelDefinition> {
    where?: WhereClause<M>;
    orderBy?: { [K in keyof M['fields']]?: 'asc' | 'desc' };
    take?: number;
    skip?: number;
    dataSize?: number;
    include?: Record<string, RelationDefinition>;
}

export interface AggregateOptions<M extends ModelDefinition> {
    where?: WhereClause<M>;
    _count?: boolean;
    _sum?: { [K in keyof M['fields']]?: boolean };
    _avg?: { [K in keyof M['fields']]?: boolean };
    _min?: { [K in keyof M['fields']]?: boolean };
    _max?: { [K in keyof M['fields']]?: boolean };
}

export interface GroupByOptions<M extends ModelDefinition> {
    by: (keyof M['fields'])[];
    where?: WhereClause<M>;
    _count?: boolean;
    _sum?: { [K in keyof M['fields']]?: boolean };
    _avg?: { [K in keyof M['fields']]?: boolean };
    _min?: { [K in keyof M['fields']]?: boolean };
    _max?: { [K in keyof M['fields']]?: boolean };
    orderBy?: { _count?: 'asc' | 'desc'; _sum?: { [K in keyof M['fields']]?: 'asc' | 'desc' } };
}

export interface QueryAdapter {
    findMany<M extends ModelDefinition>(
        model: M,
        options: FindManyOptions<M>
    ): Promise<InferModel<M>[]>;

    findByAddress<M extends ModelDefinition>(
        model: M,
        address: string
    ): Promise<InferModel<M> | null>;

    findByPda<M extends ModelDefinition>(
        model: M,
        seeds: (Buffer | Uint8Array)[]
    ): Promise<InferModel<M> | null>;
}

export interface RelationDefinition {
    model: ModelDefinition;
    foreignKey: string;   // field name at model (örn: vault.ownerPubkey)
}
