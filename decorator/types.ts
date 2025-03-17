import { 
    ColumnType,
    DefinitionOf,
    TableDefinition
} from '../types'

/**
 * Basic table decorator builder function
 */
export type TableDecoratorBuilder = (name: string, def?: TableDefinition) => ClassDecorator
export type ColumnDecoratorBuilder = <T extends ColumnType>(type: T, def?: DefinitionOf<T>) => PropertyDecorator