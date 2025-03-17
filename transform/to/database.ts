
import {
    ColumnType,
    DefinitionOf
} from '../../types'
import {
    ColumnTransformNative,
    ColumnTransformerNative
} from '../types'

import { bigIntToString } from '../type/number'
import { mapToObject } from '../type/map'
import {
    dateToDateString,
    dateToTimestamp
} from '../type/date'

/**
 * 
 * @param type 
 * @param def 
 * @returns 
 */
export function nativeToDatabaseTransform<T extends ColumnType>(type: T, def: DefinitionOf<T>): ColumnTransformNative<T> {
    const transform = nativeToDatabase[type]
    if (transform)
        return transform(def)
    
    // Generate the identity function if the database value is the same as the native representation
    return (value) => value
}

export const nativeToDatabase: Partial<ColumnTransformerNative> = {
    UInt64: bigIntToString(),
    UInt128: bigIntToString(),
    UInt256: bigIntToString(),
    Int64: bigIntToString(),
    Int128: bigIntToString(),
    Int256: bigIntToString(),

    Date: dateToDateString(),
    Date32: dateToDateString(),
    DateTime: dateToTimestamp(true),
    DateTime64: dateToTimestamp()

    // TODO - convert Decimal instance to number
    // TODO - convert Date to string or number based on DateTime or Date
}

nativeToDatabase.Map = mapToObject(nativeToDatabase)