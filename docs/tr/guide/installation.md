# Kurulum

## Gereksinimler

- Node.js 18+
- TypeScript 5+ (önerilir)
- `@solana/web3.js` v1

## Kur

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

`@solana/web3.js` bir peer dependency'dir — Curvhex ORM ile birlikte ayrıca yükle.

## TypeScript Yapılandırması

`bigint` değişmezlerinin doğru çalışması için `tsconfig.json`'a aşağıdakini ekle (`u64` / `u128` alanları için gereklidir):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"]
  }
}
```

## Kurulumu Doğrulama

```typescript
import { defineModel, CurvhexORM } from '@curvhex/orm'

console.log('Curvhex ORM başarıyla kuruldu')
```

TypeScript bunu hatasız çözümlüyorsa hazırsın.
