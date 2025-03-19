# Data Types

These are TypeScript type definitions for interfacing with ClickHouse, along with example specifications 
below of how these data types might be used in a table schema.

Examples are given as both from a strictly OOP usage of a `Table` instance, along with the equivalent
[decorator](../decorator/README.md) format. It assumes there is a `table` reference instantiated in some
way, such as below:

```typescript
import { Database, Table } from '@csvhub/core/server'

// Local ClickHouse table
const db = Database.local()
const table = db.getTable('some_table_name', { engine: 'MergeTree', /* ... */ })
```

- [Numbers](#numbers)

# Numbers

All numeric types of ClickHouse are supported and natively represented as either `number` or `BigInt`.

```typescript
export type IntAttributeType = 'Int8' | 'Int16' | 'Int32' | 'Int64' | 'Int128' | 'Int256';
export type UIntAttributeType = 'UInt8' | 'UInt16' | 'UInt32' | 'UInt64' | 'UInt128' | 'UInt256';
export type FloatAttributeType = 'Float32' | 'Float64';
export type DecimalAttributeType = 'Decimal' | 'Decimal32' | 'Decimal64' | 'Decimal128' | 'Decimal256';
```

## UInt8

Unsigned integer stored in a single byte.

```typescript
@column('UInt8', { defaultValue: 0 })
byteCounter: number

// or with a Table instance
table.addColumn('byteCounter', 'UInt8')
```

## UInt16

Unsigned integer stored in two byte.

## UInt32

Unsigned integer stored in four bytes.

## UInt64

Unsigned integer stored in eight bytes.