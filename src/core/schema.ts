import type { FieldType, FieldDefinition, ModelDefinition } from "./types";
import { createHash } from 'crypto';

// Anchor discriminator: sha256("account:<ModelName>") → fist 8 byte
export function anchor(name: string): number[] {
    const hash = createHash('sha256')
        .update(`account:${name}`)
        .digest();
    return Array.from(hash.slice(0, 8));
}

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

type FieldInput = { type: FieldType; maxLen?: number };
type ModelInput = {
    discriminator: number[];
    fields: Record<string, FieldInput>;
};

export function defineModel<T extends ModelInput>(input: T): ModelDefinition {
    const fields: Record<string, FieldDefinition> = {};
    let offset = input.discriminator.length;
    let dynamicOffset = false; // true after first variable-length field

    for (const [name, field] of Object.entries(input.fields)) {
        const baseSize = FIELD_SIZES[field.type];

        // -1 signals "offset unknown at compile time — must filter client-side"
        fields[name] = { type: field.type, offset: dynamicOffset ? -1 : offset, maxLen: field.maxLen };

        if (baseSize === 0) {
            // string/bytes: actual on-chain size is dynamic, all subsequent offsets are unknown
            dynamicOffset = true;
            offset = -1;
        } else if (!dynamicOffset) {
            offset += baseSize;
        }
    }

    return { discriminator: input.discriminator, fields };
}