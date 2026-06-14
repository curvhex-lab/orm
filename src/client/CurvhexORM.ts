import { Connection, PublicKey } from '@solana/web3.js';
import { ModelDefinition } from '../core/types';
import { QueryAdapter } from '../adapters/abstract/QueryAdapter';
import { RpcAdapter } from '../adapters/RpcAdapter';
import { CurvhexClient } from './CurvhexClient';

type ModelMap = Record<string, ModelDefinition>;

type VertexOrmClient<T extends ModelMap> = {
    [K in keyof T as Uncapitalize<string & K>]: CurvhexClient<T[K]>;
};

export class CurvhexORM<T extends ModelMap> {
    readonly models: VertexOrmClient<T>;

    constructor(config: {
        connection: Connection;
        programId: string;
        models: T;
        adapter?: QueryAdapter;
    }) {
        const programId = new PublicKey(config.programId);
        const adapter = config.adapter ?? new RpcAdapter(config.connection, programId);
        const models = {} as any;

        for (const [name, model] of Object.entries(config.models)) {
            const key = name.charAt(0).toLowerCase() + name.slice(1);
            models[key] = new CurvhexClient(adapter, model);
        }

        this.models = models;
    }
}