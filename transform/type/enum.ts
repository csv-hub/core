import { EnumColumnType, EnumDefinition } from '../../types'

import { InvalidEnumValueError } from '..'

export function stringToEnum(bits: number) {
    const limit = 2 ** bits

    return function({ values, uppercase, lowercase }: EnumDefinition) {
        // TODO: Parser should throw error if the enum values are not defined
        const valueSet = new Set<string>(Array.isArray(values) ? values : Object.keys(values))
        if (valueSet.size > limit)
            throw new Error('Too many enum values specified')

        return function(value: string) {
            if (uppercase)
                value = value.toUpperCase()
            else if (lowercase)
                value = value.toLowerCase()

            if (! valueSet.has(value)) {
                throw new InvalidEnumValueError(value, valueSet)
            }
            return value
        }
    }
}

export function enumTypeDefinition(type: EnumColumnType, def: EnumDefinition) {
    // Array of enum strings
    if (Array.isArray(def.values))
        return `${ type }(${ def.values.map((v) => `'${ v }'`).join(', ') })`
    
    // Object with explicit enum values
    else if (typeof def.values === 'object')
        return `${ type }(${ Object.keys(def.values).map((k) => `'${ k }' = ${ def.values[k] }`).join(', ') })`
    
    // Fallback to low cardinality string if enum values not defined
    return 'LowCardinality(String)'
}