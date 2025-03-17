import { ColumnType, MapDefinition } from '../../types'
import {
    ColumnTransformer, ColumnTransform, ColumnTransformBuilder,
    ColumnTransformNative, ColumnTransformerNative, ColumnTransformNativeBuilder
} from '../types'

import { parseSpecification } from './util'

export function stringToMap(transformer?: ColumnTransformer) {
    
    return function({ keyType, valueType, separator = ',', assignment = '=' }: MapDefinition): ColumnTransform<'Map'> {
        const { type: key, def: keyDef } = parseSpecification(keyType)
        const { type: value, def: valueDef } = parseSpecification(valueType)

        const keyParser = transformer[key](keyDef)
        const valueParser = transformer[value](valueDef)

        return (value: string) => new Map(value.split(separator).map((pair) => {
            const split = pair.split(assignment)
            if (split.length !== 2)
                throw new Error('Map must specify key-value pairs')

            return [ keyParser(split[0]) as string | number, valueParser(split[1]) ]
        }))
    }
}

export function objectToMap(transformer: Partial<ColumnTransformer>) {
    return function({ keyType: keyTypeSpec, valueType: valueTypeSpec }: MapDefinition) {
        const { type: keyType, def: keyDef } = parseSpecification(keyTypeSpec)
        const { type: valueType, def: valueDef } = parseSpecification(valueTypeSpec)

        const keyTransform = (transformer[keyType] ? transformer[keyType](keyDef) : ((value) => value)) as ColumnTransform<ColumnType>
        const valueTransform = (transformer[valueType] ? transformer[valueType](valueDef) : ((value) => value)) as ColumnTransform<ColumnType>

        return (value: { [key: string]: any }) => {
            const map = new Map()
            for (const key of Object.keys(value))
                map.set(keyTransform(key), valueTransform(value[key]))
            return map
        }
    }
}

export function mapToObject(transformer: Partial<ColumnTransformerNative>): ColumnTransformNativeBuilder<'Map'> {
    return function({ valueType }: MapDefinition) {
        const { type, def } = parseSpecification(valueType)
        const valueTransform = (transformer[type] ? transformer[type](def) : ((value) => value)) as ColumnTransformNative<ColumnType>

        return (value: Map<any, any>) => {
            if (! (value instanceof Map) && typeof value === 'object')
                return value

            const obj: { [key: string]: any } = {}
            for (const key of value.keys())
                obj[key] = valueTransform(value.get(key))
            return obj
        }
    }
}

export function mapTypeDefinition(_: 'Map', { keyType, valueType }: MapDefinition) {
    const { type: key } = parseSpecification(keyType)
    const { type: value } = parseSpecification(valueType)
    return `Map(${ key }, ${ value })`
}