import { 
    ColumnType,
    DefinitionOf,
    ColumnSpecification
} from '../../types'

export function parseSpecification<S extends ColumnSpecification<T>, T extends ColumnType = ColumnType>(spec: S): { type: T, def: DefinitionOf<T> } {
    const type = ((typeof spec === 'string') ? spec : spec.type) as T
    const def = ((typeof spec === 'string') ? {} : spec) as DefinitionOf<T>
    return { type, def }
}