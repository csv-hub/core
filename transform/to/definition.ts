import { DefinitionOf, ColumnType, ColumnDefinition } from 'types'
import { ColumnTypeTransformer } from '../types'

// Type definitions
import { decimalTypeDefinition } from '../type/number'
import { enumTypeDefinition } from '../type/enum'
import { stringTypeDefinition } from '../type/string'
import { dateTypeDefinition } from '../type/date'
import { mapTypeDefinition } from '../type/map'
import { arrayTypeDefinition } from '../type/array'

export function getColumnTypeDefinition<T extends ColumnType>(type: T, def?: DefinitionOf<T>): string {
    def = def || {} as DefinitionOf<T>
    // Resolve Nullable
    if (def.optional)
        return `Nullable(${ getColumnTypeDefinition(type, { ...def, optional: false }) })`
    
    // Call the transformer for the given type if defined, otherwise return the 
    const transformer = typeDefinition[type]
    if (transformer)
        return transformer(type, def)
    else return type
}

const typeDefinition: ColumnTypeTransformer = {
    Decimal: decimalTypeDefinition,
    Decimal32: decimalTypeDefinition,
    Decimal64: decimalTypeDefinition,
    Decimal128: decimalTypeDefinition,
    Decimal256: decimalTypeDefinition,
    Enum: enumTypeDefinition,
    Enum8: enumTypeDefinition,
    Enum16: enumTypeDefinition,
    String: stringTypeDefinition,
    FixedString: stringTypeDefinition,
    Date: dateTypeDefinition,
    Date32: dateTypeDefinition,
    DateTime: dateTypeDefinition,
    DateTime64: dateTypeDefinition,
    Array: arrayTypeDefinition,
    Map: mapTypeDefinition
}