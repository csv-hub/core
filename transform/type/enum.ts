import { EnumColumnType, EnumDefinition } from '../../types'

import { InvalidEnumValueError } from '..'

export function stringToEnum(bits: number) {
    const limit = 2 ** bits

    return function({ values, replace, replaceWith, uppercase, lowercase, substring, emptyStringNull }: EnumDefinition) {
        // TODO: Parser should throw error if the enum values are not defined
        const valueSet = new Set<string>(Array.isArray(values) ? values : Object.keys(values))
        if (emptyStringNull)
            valueSet.add('')
        if (valueSet.size > limit)
            throw new Error('Too many enum values specified')

        const transformers: Array<(value: string) => string> = []
        if (replace)
            transformers.push((value) => value.replace(replace, replaceWith || ''))
        if (uppercase)
            transformers.push((value) => value.toUpperCase())
        if (lowercase)
            transformers.push((value) => value.toLowerCase())
        if (Array.isArray(substring))
            transformers.push((value) => value.substring(substring[0], substring[1]))
        else if (typeof substring === 'number')
            transformers.push((value) => value.substring(substring))

        return function(value: string) {
            value = transformers.reduce((v, t) => t(v), value)
            
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
        return `${ type }(${ (def.emptyStringNull ? def.values.concat(['']) : def.values).map((v) => `'${ v }'`).join(', ') })`
    
    // Object with explicit enum values
    else if (typeof def.values === 'object')
        return `${ type }(${ Object.keys(def.values).map((k) => `'${ k }' = ${ def.values[k] }`).join(', ') })`
    
    // Fallback to low cardinality string if enum values not defined
    return 'LowCardinality(String)'
}