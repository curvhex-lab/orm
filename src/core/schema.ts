import type { FieldType, FieldDefinition, ModelDefinition } from "./types";


const FIELD_SIZES: Record<FieldType, number> = {
    u8: 1, i8: 1,
    u16: 2, i16: 2,
    u32: 4, i32: 4,
    u64: 8, i64: 8,
    u128: 16, i128: 16,
    bool: 1,
    publicKey: 32,
    string: 0,   
    bytes: 0,    
};

type FieldInput = { type: FieldType };
type ModelInput = {
    discriminator: number[];
    fields: Record<string, FieldInput>;
};

export function defineModel<T extends ModelInput>(input: T): ModelDefinition {
    const fields: Record<string, FieldDefinition> = {};
    let offset = input.discriminator.length;

    for (const [name, field] of Object.entries(input.fields)) {
        const size = FIELD_SIZES[field.type];

        fields[name] = { type: field.type, offset };

        offset += size === 0 ? 4 : size;
    }

    return { discriminator: input.discriminator, fields };
}