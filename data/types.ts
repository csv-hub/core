import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config'

import { ColumnType, DefinitionOf, NativeTypeOf } from '../types'

/**
 * Adds additional parameters to ClickHouse client configuration object
 */
export interface DatabaseLocation extends NodeClickHouseClientConfigOptions {
    url?: string             // defaults to "http://localhost:8173"
    database?: string        // defaults to "default"
}

export interface ClickHouseDatabase {
    name: string
    engine: string
    engine_full: string
    data_path: string
    metadata_path: string
    uuid: string
    comment: string
}

export interface ClickHouseTable {
    database: string
    name: string
    uuid: string
    engine: string
    engine_full: string
    is_temporary: boolean
    
    // Key specification
    partition_key: string
    sorting_key: string
    primary_key: string

    total_rows: number
    total_bytes: number
    total_bytes_uncompressed: number
    parts: number
    active_parts: number
    total_marks: number
}

/**
 * TODO export database configuration to object
 */
export interface DatabaseSpecification {
    
}

// Function/instance/class types
export type AnyFunction = (...args: any[]) => any
export type AnyAsyncFunction = (...args: any[]) => Promise<any>
export type AnyClass<T = any> = { new(...args: any[]): T }
export type AnyObject = { [key: string]: any }
export type AnyInstance = { [key: string | symbol]: any }


export type AttributeParser<T extends ColumnType, V = any> = (value: V) => NativeTypeOf<T>
export type AttributeParserMap<V = any> = {
    [T in ColumnType]: (def: DefinitionOf<T>) => AttributeParser<T, V>
}

/**
 * 
 */
export type InstanceOf<T extends AnyClass> = InstanceType<T>
export type ColumnName<T extends AnyClass> = Exclude<keyof InstanceOf<T>, symbol>

export type ColumnObject<T extends AnyClass, I = InstanceType<T>> = Omit<{
    [K in Exclude<keyof I, symbol | number>]: I[K] extends Function ? never : I[K]
}, symbol | number>