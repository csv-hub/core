/**
 * Primary type used to represent a valid column type specification, like "UInt8" or "Array".
 * The column type specification does not include parameters for types like Array<String> -
 * this is implemented with the adjacent [column definition type](./definition.ts).
 * 
 * @see definition.ts
 */
export type ColumnType = IntColumnType |
    UIntColumnType |
	FloatColumnType |
	DecimalColumnType |
    EnumColumnType |
    StringColumnType |
    DateColumnType |
    BooleanColumnType |
    IPColumnType |
	UUIDColumnType | 'Map' | 'Array'

// Numbers
export type NumberColumnType = IntColumnType | UIntColumnType | DecimalColumnType | FloatColumnType
export type IntegerColumnType = IntColumnType | UIntColumnType

// String types
export type StringColumnType = 'String' | 'FixedString'
export type EnumColumnType = 'Enum' | 'Enum8' | 'Enum16'
export type IPColumnType = 'IPv4' | 'IPv6'
export type UUIDColumnType = 'UUID'

// Other types
export type DateColumnType = 'Date' | 'Date32' | 'DateTime' | 'DateTime64'
export type BooleanColumnType = 'Bool'

// Group by ClickHouse type prefix
// Note: different from IntegerColumnType which includes UInt types as well
export type IntColumnType = 'Int8' | 'Int16' | 'Int32' | 'Int64' | 'Int128' | 'Int256'
export type UIntColumnType = 'UInt8' | 'UInt16' | 'UInt32' | 'UInt64' | 'UInt128' | 'UInt256'
export type FloatColumnType = 'Float32' | 'Float64'
export type DecimalColumnType = 'Decimal' | 'Decimal32' | 'Decimal64' | 'Decimal128' | 'Decimal256'

/*
 * These are the native types as they are represented in JavaScript when loaded from ClickHouse.
 */
export type NativeNumberType = 'Int8' | 'Int16' | 'Int32' | 'UInt8' | 'UInt16' | 'UInt32' | FloatColumnType | DecimalColumnType
export type NativeBigIntType = 'Int64' | 'Int128' | 'Int256' | 'UInt64' | 'UInt128' | 'UInt256'
export type NativeStringType = 'UUID' | StringColumnType | IPColumnType | EnumColumnType
