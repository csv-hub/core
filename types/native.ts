import {
	ColumnType,
	DefinitionOf,
	BooleanColumnType,
    EnumColumnType,
	NativeNumberType,
	NativeBigIntType,
	NativeStringType,
	DateColumnType,
	MapDefinition,
	ArrayDefinition,
    ColumnSpecification
} from '.'

/**
 * Map a ClickHouse type to a native type.
 */
export type NativeTypeOf<
        T extends ColumnType,
        D extends DefinitionOf<T> = DefinitionOf<T>
    > = (ColumnType extends T ? any :
    T extends BooleanColumnType ? boolean :
    T extends NativeNumberType ? number :
    T extends NativeBigIntType ? BigInt :
    T extends NativeStringType ? string :
    T extends DateColumnType ? Date :
    T extends EnumColumnType ? string :
    T extends 'Map' ? (
        D extends MapDefinition ?
            Map<NativeTypeOfSpecification<D['keyType']>, NativeTypeOfSpecification<D['valueType']>> : Map<any, any>
        ) :
    T extends 'Array' ? (
        D extends ArrayDefinition ?
            Array<NativeTypeOfSpecification<D['elementType']>> : any[]
        ) : any
)

export type NativeTypeOfSpecification<S extends ColumnSpecification> = (ColumnType extends S ? any :
    S extends { type: ColumnType } ? NativeTypeOf<S["type"]> :
    S extends ColumnType ? NativeTypeOf<S> : never
)