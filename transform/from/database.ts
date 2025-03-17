import { ColumnType, DefinitionOf } from '../../types'
import { ColumnTransformer, ColumnTransform } from '../types'

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
import { objectToMap } from '../type/map'
import { 
    stringToDate,
    dateFormatToDate
} from '../type/date'

export function databaseToNativeTransform<T extends ColumnType>(type: T, def: DefinitionOf<T>): ColumnTransform<T> {
    if (databaseToNative[type])
        return databaseToNative[type](def)
    // Identity function
    return (value) => value
}

/**
 * Mapping of every ClickHouse type to a function which generates a transformation function
 * from a column definition for the given type.
 */
export const databaseToNative: Partial<ColumnTransformer> = {
    Int64: stringToBigInt(64),
    Int128: stringToBigInt(128),
    Int256: stringToBigInt(256),
    UInt64: stringToBigInt(64),
    UInt128: stringToBigInt(128),
    UInt256: stringToBigInt(256),
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
    Date: dateFormatToDate(),
    Date32: dateFormatToDate(),
    DateTime: dateFormatToDate('YYYY-MM-DD hh:mm:ss'),
    DateTime64: dateFormatToDate('YYYY-MM-DD hh:mm:ss.nnn'),
    IPv4: stringToIP(),
    IPv6: stringToIP(true),
    Bool: stringToBoolean(),
    UUID: stringToUUID()
}

// Reference the map for nested types
// databaseToNative.Array = arrayToArray(databaseToNative)
databaseToNative.Map = objectToMap(databaseToNative)