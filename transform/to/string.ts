import {
    ColumnType,
    DefinitionOf
} from '../../types'
import {
    ColumnTransformNative,
    ColumnTransformerNative
} from '../types'

import {
    decimalToString
} from '../type/number'

/**
 * 
 * @param type 
 * @param def 
 * @returns 
 */
export function nativeToStringTransform<T extends ColumnType>(type: T, def: DefinitionOf<T>): ColumnTransformNative<T> {
    const transform = nativeToString[type]
    if (transform)
        return transform(def)
    
    // Generate a simple stringifying function for defined values
    return () => ((value) => (value == null ? '' : value.toString()))
}

export const nativeToString: Partial<ColumnTransformerNative> = {
    // TODO - convert Decimal instance to number
}