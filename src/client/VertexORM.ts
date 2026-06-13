import { Connection, PublicKey } from '@solana/web3.js';
import { ModelDefinition } from './types';
import { ModelClient } from './client';

type ModelMap = Record<string, ModelDefinition>;

type VertexOrmClient<T extends ModelMap> = {
    [K in keyof T as Uncapitalize<string & K>]: ModelClient<T[K]>;
};

export class VertexORM<T extends ModelMap> {
    readonly models: VertexOrmClient<T>;

    constructor(config: {
        connection: Connection;
        programId: string;
        models: T;
    }) {
        const programId = new PublicKey(config.programId);
        const models = {} as any;

        for (const [name, model] of Object.entries(config.models)) {
            const key = name.charAt(0).toLowerCase() + name.slice(1);
            models[key] = new ModelClient(config.connection, programId, model);
        }

        this.models = models;
    }
}