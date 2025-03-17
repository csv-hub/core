//
// This file is not referenced in any default mappings of the types directory, because it pollutes the global
// scope and is only intended to be loaded by an explicit submodule require of "@clickizen/data/decorator". 
// This is only done for the purpose of enabling the latest data typings in a table/dictionary/view specification 
// when directly editing it in a TypeScript editor like VSCode.
//
// Both manually and auto-generated table schema definitions must open with a decorator initialization for
// typings to properly work in the editor (the file can still be parsed without this declaration).
//
// ------ my_table.ts -----------------------
// import '@clickizen/data/decorator'
//
// @table('my_table')
// class SomeTable { 
//    @attr('UInt8') id: number
// }
//
// ------ my_app.ts -----------------------
// const db = new Database({ ... })
// await db.loadTable('/path/to/my_table')

import {
	ColumnType,
	TableDefinition,
	DefinitionOf
} from '../types'

import { TableDecoratorBuilder } from './types'

export {}

/**
 * 
 */
declare global {
    /**
     * Defines a class as a representation of the given table, with certain property keys of the class corresponding to
     * particular columns of the table.
     * 
     * @param name 
     * @param def 
     */
    const table: TableDecoratorBuilder

    /**
     * 
     * @param type 
     * @param def 
     */
    function column<T extends ColumnType>(type: T, def?: DefinitionOf<T>): PropertyDecorator

    /**
     * Must be a function which either returns an asType(...) to type correct the
     * output to a specified column type, or an expression as-is to get a string value
     * 
     * class Loan {
     *      
     *     @expr()
     *     static get total_loans(): number {
     *         return asNumber('count()')
     *     }    
     * 
     * }
     */
    function select(name: string): MethodDecorator

    // TODO: return an object  
    function asType(type: string, expr: string): any
    function asNumber(): any
}
