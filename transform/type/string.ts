import { 
    IPColumnType,
    NativeStringType,
    StringColumnType,
    StringDefinition
} from '../../types'

import {
    ColumnTransformBuilder,
    ColumnTransformNativeBuilder
} from '../types'

export function stringToString(fixed = false): ColumnTransformBuilder<StringColumnType> {

    return function(def: StringDefinition) {
        // If fixed length, validate source length
        if (fixed && def.length) {
            return function (value: string) {
                if (value.length != def.length)
                    throw new Error('string length')
                return value
            }
        }

        // Return identity function
        return (value: string) => value
    }
}

export function stringTypeDefinition(type: StringColumnType, def: StringDefinition) {
    const strDef = (type == 'FixedString' && def.length != null) ? `FixedString(${ def.length })` : type
    return def.lowCardinality ? `LowCardinality(${ strDef })` : strDef
}

export function stringToCSV(): ColumnTransformNativeBuilder<NativeStringType> {
    return function() {
        return (value: string) => `"${ value.replace(/"/g, '""') }"`
    }
}

export function stringToUUID(): ColumnTransformBuilder<'UUID'> {
    return function() {
        // TODO: validate UUID v4
        return (value: string) => value
    }
}

export function stringToIP(v6 = false): ColumnTransformBuilder<IPColumnType> {
    return function() {
        // TODO: validate IP versions
        return (value: string) => value
    }
}