// Array types
import { ArrayDefinition } from '../../types'

import { 
    // Transformer maps
    ColumnTransformer, ColumnTransformerNative, ColumnTypeTransformer,
    // Transformer builders
    ColumnTransformBuilder, ColumnTransformNativeBuilder
} from '../types'

// Contains nested specifications
import { parseSpecification } from './util'

/**
 * Convert a string to the specified array type, and throws an error if the value cannot be parsed.
 * Can set the "separator" key in the type definition to split by another separator than the default comma.
 * 
 * @param transformer 
 * @returns 
 */
export function stringToArray(transformer?: ColumnTransformer<string>): ColumnTransformBuilder<'Array'> {
    
    // Default values to apply into array definition
    return function({ separator = ',', elementType }: ArrayDefinition) {
        const { type, def } = parseSpecification(elementType)
        const elementParser = transformer[type](def)

        // Split by the separator and parse each element value
        return function(value: string) {
            return value.split(separator).map((e) => elementParser(e))
        }
    }
}

/**
 * 
 * @param transformer 
 * @returns 
 */
export function arrayToString(transformer: ColumnTransformerNative<string>): ColumnTransformNativeBuilder<'Array'> {

    return function({ separator = ',', elementType }: ArrayDefinition) {
        const { type, def } = parseSpecification(elementType)
        const elementTransform = transformer[type](def)

        return function(value: any[]) {
            return value.map(elementTransform).join(separator)
        }
    }

}

export function arrayTypeDefinition(_: 'Array', { elementType }: ArrayDefinition) {
    const { type } = parseSpecification(elementType)
    return `Array(${ type })`
}