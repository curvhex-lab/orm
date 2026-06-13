import { ModelDefinition, InferModel } from './types';

export function deserialize<M extends ModelDefinition>(
    model: M,
    data: Buffer,
    address: string
): InferModel<M> {
    const result: Record<string, unknown> = { address };

    for (const [name, field] of Object.entries(model.fields)) {
        const { type, offset } = field;

        switch (type) {
            case 'u8':
                result[name] = data.readUInt8(offset);
                break;

            case 'u16':
                result[name] = data.readUInt16LE(offset);
                break;

            case 'u32':
                result[name] = data.readUInt32LE(offset);
                break;

            case 'u64':
                result[name] = data.readBigUInt64LE(offset);
                break;

            case 'u128':
                const lo = data.readBigUInt64LE(offset);
                const hi = data.readBigUInt64LE(offset + 8);
                result[name] = (hi << 64n) | lo;
                break;

            case 'i8':
                result[name] = data.readInt8(offset);
                break;

            case 'i16':
                result[name] = data.readInt16LE(offset);
                break;

            case 'i32':
                result[name] = data.readInt32LE(offset);
                break;

            case 'i64':
                result[name] = data.readBigInt64LE(offset);
                break;

            case 'bool':
                result[name] = data.readUInt8(offset) === 1;
                break;

            case 'publicKey':
                result[name] = base58Encode(data.slice(offset, offset + 32));
                break;

            case 'string': {
                const len = data.readUInt32LE(offset);
                result[name] = data.slice(offset + 4, offset + 4 + len).toString('utf8');
                break;
            }

            case 'bytes': {
                const len = data.readUInt32LE(offset);
                result[name] = data.slice(offset + 4, offset + 4 + len).toString('hex');
                break;
            }
        }
    }

    return result as InferModel<M>;
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Buffer): string {
    let num = BigInt('0x' + bytes.toString('hex'));
    let encoded = '';

    while (num > 0n) {
        encoded = BASE58_ALPHABET[Number(num % 58n)] + encoded;
        num = num / 58n;
    }

    // Leading zero bytes → '1'
    for (const byte of bytes) {
        if (byte !== 0) break;
        encoded = '1' + encoded;
    }

    return encoded;
}