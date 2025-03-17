import {
    ColumnType, DefinitionOf,
    NativeTypeOf,
} from '../types'

/**
 * Transforms the target value (or any value) into the native representation for the parametrized type.
 */
export type ColumnTransform<T extends ColumnType, V = any> = (value: V) => NativeTypeOf<T>
export type ColumnTransformBuilder<T extends ColumnType, V = any> = (def: DefinitionOf<T>) => ColumnTransform<T, V>

/**
 * A column value transformation that takes the native representation of the column value, and produces
 * the specified value. This is commonly used to transform the native representation of a column into a
 * CSV string or into a value that can be inserted into ClickHouse.
 */
export type ColumnTransformNative<T extends ColumnType, V = any> = (value: NativeTypeOf<T>) => V
export type ColumnTransformNativeBuilder<T extends ColumnType, V = any> = (def: DefinitionOf<T>) => ColumnTransformNative<T, V>

/**
 * A map of all CH types to a transformer function to produce the specified value
 */
export type ColumnTransformer<V = any> = {
    [T in ColumnType]: ColumnTransformBuilder<T, V>
}

/**
 * A map of all CH types to a transformer function to produce the specified value
 */
export type ColumnTransformerNative<V = any> = {
    [T in ColumnType]: ColumnTransformNativeBuilder<T, V>
}

// Transform a type definition to a string, used in create table commands
export type ColumnTypeTransform<T extends ColumnType> = (type: T, def: DefinitionOf<T>) => string
export type ColumnTypeTransformer<V = any> = Partial<{
    [T in ColumnType]: ColumnTypeTransform<T>
}>