# Data Types

These are the data types supported by ClickHouse, along with example specifications of these data types in a table schema.

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

## UInt16

Unsigned integer stored in two byte.

## UInt32

Unsigned integer stored in four bytes.

## UInt64

Unsigned integer stored in eight bytes.