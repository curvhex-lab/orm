# Installation

## Requirements

- Node.js 18+
- TypeScript 5+ (recommended)
- `@solana/web3.js` v1

## Install

::: code-group

```bash [npm]
npm install @curvhex/orm @solana/web3.js
```

```bash [yarn]
yarn add @curvhex/orm @solana/web3.js
```

```bash [pnpm]
pnpm add @curvhex/orm @solana/web3.js
```

:::

`@solana/web3.js` is a peer dependency — install it separately alongside Curvhex ORM.

## TypeScript Configuration

Add the following to your `tsconfig.json` to ensure `bigint` literals work correctly (required for `u64` / `u128` fields):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"]
  }
}
```

## Verifying the Install

```typescript
import { defineModel, CurvhexORM } from '@curvhex/orm'

console.log('Curvhex ORM installed correctly')
```

If TypeScript resolves this without errors, you're good to go.
