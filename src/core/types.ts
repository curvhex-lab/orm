export type FieldType =
    | 'u8' | 'u16' | 'u32' | 'u64' | 'u128'
    | 'i8' | 'i16' | 'i32' | 'i64' | 'i128'
    | 'bool'
    | 'publicKey'
    | 'string'
    | 'bytes';

export interface FieldDefinition {
    type: FieldType;
    offset: number;
}


export interface ModelDefinition {
    discriminator: number[];
    fields: Record<string, FieldDefinition>;
}

export type InferFieldType<T extends FieldType> =
    T extends 'u64' | 'u128' | 'i64' | 'i128' ? bigint :
    T extends 'u8' | 'u16' | 'u32' | 'i8' | 'i16' | 'i32' ? number :
    T extends 'bool' ? boolean :
    T extends 'publicKey' ? string :
    T extends 'string' | 'bytes' ? string :
    never;


export type InferModel<M extends ModelDefinition> = {
    [K in keyof M['fields']]: InferFieldType<M['fields'][K]['type']>
} & { address: string };