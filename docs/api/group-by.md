# groupBy

Groups accounts by one or more fields and runs aggregations per group.

## Signature

```typescript
groupBy(options: GroupByOptions<M>): Promise<GroupByResult<M>[]>
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `by` | `(keyof M['fields'])[]` | Fields to group by |
| `where` | `WhereClause<M>` | Filter before grouping |
| `_count` | `true` | Count per group |
| `_sum` | `{ [field]: true }` | Sum per group |
| `_avg` | `{ [field]: true }` | Average per group |
| `_min` | `{ [field]: true }` | Minimum per group |
| `_max` | `{ [field]: true }` | Maximum per group |

## Examples

### Group by single field

```typescript
const byTier = await orm.models.userAccount.groupBy({
  by:     ['tier'],
  _count: true,
  _sum:   { balance: true },
})

// → [
//     { tier: 1, _count: 102, _sum: { balance: 3_000_000n } },
//     { tier: 2, _count: 40,  _sum: { balance: 2_000_000n } },
//   ]
```

### Group by multiple fields

```typescript
const breakdown = await orm.models.userAccount.groupBy({
  by:     ['tier', 'isActive'],
  _count: true,
  _avg:   { balance: true },
})

// → [
//     { tier: 1, isActive: true,  _count: 95, _avg: { balance: 28_000n } },
//     { tier: 1, isActive: false, _count: 7,  _avg: { balance:  5_000n } },
//     { tier: 2, isActive: true,  _count: 40, _avg: { balance: 50_000n } },
//   ]
```

### With a filter

```typescript
const activeTiers = await orm.models.userAccount.groupBy({
  by:     ['tier'],
  where:  { isActive: true },
  _count: true,
})
```

## Return Value

An array where each element contains:
- The value of each `by` field for that group
- The requested aggregation results (`_count`, `_sum`, etc.)

Groups are returned in an unspecified order. Sort client-side if needed.
