import { ModelDefinition, FieldType } from './types';

export interface MemcmpFilter {
    memcmp: { offset: number; bytes: string };
}

export interface DataSizeFilter {
    dataSize: number;
}

export type RpcFilter = MemcmpFilter | DataSizeFilter;

// Kullanıcının yazabileceği where operatörleri
export type WhereOperator<T> =
    | T  // direkt eşitlik: { balance: 100n }
    | { eq?: T; not?: T; gt?: T; gte?: T; lt?: T; lte?: T; in?: T[]; between?: [T, T] };

export type WhereClause<M extends ModelDefinition> = {
    [K in keyof M['fields']]?: WhereOperator<any>;
};

// Field değerini byte array'e çevir (memcmp için)
function encodeValue(type: FieldType, value: unknown): Buffer {
    switch (type) {
        case 'u8': case 'i8': {
            const b = Buffer.alloc(1);
            b.writeUInt8(value as number, 0);
            return b;
        }
        case 'u16': case 'i16': {
            const b = Buffer.alloc(2);
            b.writeUInt16LE(value as number, 0);
            return b;
        }
        case 'u32': case 'i32': {
            const b = Buffer.alloc(4);
            b.writeUInt32LE(value as number, 0);
            return b;
        }
        case 'u64': {
            const b = Buffer.alloc(8);
            b.writeBigUInt64LE(value as bigint, 0);
            return b;
        }
        case 'i64': {
            const b = Buffer.alloc(8);
            b.writeBigInt64LE(value as bigint, 0);
            return b;
        }
        case 'bool': {
            const b = Buffer.alloc(1);
            b.writeUInt8(value ? 1 : 0, 0);
            return b;
        }
        case 'publicKey': {
            return base58Decode(value as string);
        }
        default:
            throw new Error(`${type} tipi memcmp filtresinde kullanılamaz`);
    }
}


export function buildFilters<M extends ModelDefinition>(
    model: M,
    where: WhereClause<M>
): { rpcFilters: RpcFilter[]; clientFilters: ClientFilter[] } {
    const rpcFilters: RpcFilter[] = [];
    const clientFilters: ClientFilter[] = [];

    if (model.discriminator.length > 0) {
        rpcFilters.push({
            memcmp: {
                offset: 0,
                bytes: Buffer.from(model.discriminator).toString('base64'),
            }
        });
    }

    for (const [fieldName, condition] of Object.entries(where)) {
        const fieldDef = model.fields[fieldName];
        if (!fieldDef) continue;

        const eqValue = isDirectValue(condition)
            ? condition
            : (condition as any)?.eq;

        if (eqValue !== undefined) {
            const encoded = encodeValue(fieldDef.type, eqValue);
            rpcFilters.push({
                memcmp: {
                    offset: fieldDef.offset,
                    bytes: encoded.toString('base64'),
                }
            });
            continue;
        }

        clientFilters.push({ fieldName, fieldDef, condition: condition as any });
    }

    return { rpcFilters, clientFilters };
}

export interface ClientFilter {
    fieldName: string;
    fieldDef: { type: FieldType; offset: number };
    condition: { gt?: any; gte?: any; lt?: any; lte?: any; in?: any[]; between?: [any, any]; not?: any };
}

export function applyClientFilters<T extends Record<string, any>>(
    records: T[],
    clientFilters: ClientFilter[]
): T[] {
    return records.filter(record =>
        clientFilters.every(({ fieldName, condition }) => {
            const val = record[fieldName];

            if (condition.gt !== undefined && !(val > condition.gt)) return false;
            if (condition.gte !== undefined && !(val >= condition.gte)) return false;
            if (condition.lt !== undefined && !(val < condition.lt)) return false;
            if (condition.lte !== undefined && !(val <= condition.lte)) return false;
            if (condition.not !== undefined && (val === condition.not)) return false;
            if (condition.in !== undefined && !condition.in.includes(val)) return false;
            if (condition.between !== undefined) {
                const [min, max] = condition.between;
                if (!(val >= min && val <= max)) return false;
            }

            return true;
        })
    );
}

function isDirectValue(v: unknown): boolean {
    if (v === null || v === undefined) return false;
    const type = typeof v;
    return type === 'string' || type === 'number' || type === 'bigint' || type === 'boolean';
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(str: string): Buffer {
    let num = 0n;
    for (const char of str) {
        const idx = BASE58_ALPHABET.indexOf(char);
        if (idx < 0) throw new Error(`Geçersiz base58 karakter: ${char}`);
        num = num * 58n + BigInt(idx);
    }

    const hex = num.toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
}