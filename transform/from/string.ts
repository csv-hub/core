import type { ColumnType, DefinitionOf } from '../../types'

import type { ColumnTransformer } from '../types'

import { 
    stringToInteger,
    stringToBigInt, 
    stringToFloat, 
    stringToDecimal
} from '../type/number'
import { 
    stringToString, 
    stringToUUID, 
    stringToIP
} from '../type/string'
import { stringToBoolean } from '../type/boolean'
import { stringToEnum } from '../type/enum'
import { stringToArray } from '../type/array'
import { stringToMap } from '../type/map'
import { stringToDate } from '../type/date'

/**
 * The string to native transformation is a complete mapping of all valid ClickHouse types to
 * a string transformation function that parses a native value from a string source. This is the
 * most common mapping used for parsing CSV files.
 * 
 * @param type 
 * @param def 
 * @returns 
 */
export function stringToNativeTransform<T extends ColumnType>(type: T, def: DefinitionOf<T>) {
    return stringToNative[type](def)
}

/**
 * Mapping of every ClickHouse type to a function which generates a transformation function
 * from a column definition for the given type.
 */
export const stringToNative: ColumnTransformer<string> = {
    Int8: stringToInteger(8),
    Int16: stringToInteger(16),
    Int32: stringToInteger(32),
    Int64: stringToBigInt(64),
    Int128: stringToBigInt(128),
    Int256: stringToBigInt(256),
    UInt8: stringToInteger(8, true),
    UInt16: stringToInteger(16, true),
    UInt32: stringToInteger(32, true),
    UInt64: stringToBigInt(64, true),
    UInt128: stringToBigInt(128, true),
    UInt256: stringToBigInt(256, true),
    Float32: stringToFloat(),
    Float64: stringToFloat(),
    Decimal: stringToDecimal(),
    Decimal32: stringToDecimal(),
    Decimal64: stringToDecimal(),
    Decimal128: stringToDecimal(),
    Decimal256: stringToDecimal(),
    Enum: stringToEnum(8),
    Enum8: stringToEnum(8),
    Enum16: stringToEnum(16),
    String: stringToString(),
    FixedString: stringToString(true),
    Date: stringToDate(),
    Date32: stringToDate(true),
    DateTime: stringToDate(true),
    DateTime64: stringToDate(true),
    IPv4: stringToIP(),
    IPv6: stringToIP(true),
    Bool: stringToBoolean(),
    UUID: stringToUUID(),
    Array: stringToArray(),
    Map: stringToMap()
}

// Reference the map for nested types
stringToNative.Array = stringToArray(stringToNative)
stringToNative.Map = stringToMap(stringToNative)