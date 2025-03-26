'use server'

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import { 
    Database, 
    Column,

    // Table commands
    CreateTableCommand, 
    OptimizeTableCommand,
    DropTableCommand,

    AlterColumnCommand,
    
    // Queries
    SelectQuery,
    ExistsTableCommand
} from '.'

import { 
    TableTransportError
} from './error'

import { CSVFile } from '../csv'
import type { CSVErrorLog } from '../csv/types'

import type { TableDefinition, TableEngine, ColumnType, DefinitionOf, TableTransportOption } from '../types'
import { AnyClass, AnyObject, ColumnObject } from './types'
import { createTransport } from '../csv'
import { createTemporaryDirectory } from '../csv/util/filesystem'
import * as log from './log'

/**
 * Represents a database table in ClickHouse.
 */
export class Table<T extends AnyClass = AnyClass> {
    /**
     * Parametrized class to use for typings on this table.
     */
    private row?: T

    // Table configuration
    private db: Database
    private name: string
    private def: TableDefinition

    // Column and other property mappings
	private column: Record<string, Column<any>> = {}
    private csv: Record<string, Column<any>> = {}

    // List of all columns and other encapsulations
	private columns: Array<Column<any>> = []

    /**
     * 
     * @param db 
     * @param name 
     * @param def 
     * @param row 
     */
    constructor(db: Database, name: string = '', def: TableDefinition = {}, row?: T) {
        this.db = db
        this.name = name
        this.def = def
        this.row = row
    }

    // TABLE COMMANDS
    // These are quick functions for producing commands for create/read/update/delete on tables.
    
    /**
     * @func        create
     * @desc        Build a command for creating this table.
     * @returns 
     */
    create() {
        return new CreateTableCommand(this)
    }

    async exists() {
        const { data } = await new ExistsTableCommand(this).result()
        return data[0]['result'] === 1
    }
    
    alter(column: string) {
        return new AlterColumnCommand(this, column)
    }
    
    drop() {
        return new DropTableCommand(this)
    }

    optimize() {
        return new OptimizeTableCommand(this)
    }

    select(...exprs: Array<string | Record<string, string>>): SelectQuery<T> {
        return new SelectQuery<T>(this).columns(...exprs)
    }

    selectAll(): SelectQuery<T> {
        return this.select().allColumns()
    }

    addColumn<C extends ColumnType>(name: string, type?: C, def?: DefinitionOf<C>): Column<C> {
        const column = new Column(name, type, def)
        this.column[name] = column
        this.columns.push(column)

        // Add to CSV mapping
        if (def && def.csv)
            this.csv[def.csv] = column

        return column
    }

    addColumnsFrom(table?: Table) {
        if (! table) return this
        
        for (const column of table.columns) {
            this.addColumn(column.name, column.type, column.getDefinition())
        }
        return this
    }

    async transport({ destination = createTemporaryDirectory('transport'), version, verbose, useCache }: TableTransportOption = {}) {
        // Get transport definition from callback or directly from definition object
        const definedTransport = (typeof this.def.transport === 'function') ? this.def.transport(version) : this.def.transport
        const definedCSV = (typeof this.def.csv === 'function') ? this.def.csv(version) : this.def.csv
        if (! definedTransport)
            throw new TableTransportError(this)

        log.tableTransportStart(this, destination, verbose)
        await this.create().orReplace().execute()
        
        const transports = Array.isArray(definedTransport) ? definedTransport : [ definedTransport ]
        const csvFiles = Array.isArray(definedCSV) ? definedCSV : [ definedCSV ]

        for (const transportDef of transports) {
            log.tableTransport(this, transportDef, verbose)
            await createTransport(transportDef)({ destination, verbose, useCache })
        }

        log.tableTransportFinish(this, verbose)
        const errorLog: CSVErrorLog = {}
        for (const csvFile of csvFiles) {
            const csv = new CSVFile(path.join(destination, csvFile))
            csv.logErrors(errorLog)
            await csv.insertIntoTable(this)
        }
        log.tableTransportErrors(errorLog)
    }

    async insertFromCSV(filename: string, withHeaders = true) {
        const result = await this.db.getClient().insert({
            table: this.getName(),
            values: fs.createReadStream(filename),
            format: withHeaders ? 'CSVWithNames' : 'CSV'
        })
        // console.log('csv', result)
    }

    async insertValid(values: Array<AnyObject>, batch?: number) {
        return this.insert(values as Array<ColumnObject<T>>, batch)
    }

    async insert(values: Array<ColumnObject<T>>, batchSize?: number) {
        if (batchSize != null && values.length > batchSize)
            return this.batchInsert(values, batchSize)

        const result = await this.db.getClient().insert({
            table: this.getName(),
            values: values.map((value) => this.toDatabase(value)),
            format: 'JSON'
        })
    }

    private async batchInsert(values: Array<ColumnObject<T>>, batch: number): Promise<any> {
        // TODO: error handling and exponential backoff
        for (let i = 0 ; i < values.length ; i += batch) {
            await this.db.getClient().insert({
                table: this.getName(),
                values: values.slice(i, i + batch).map((value) => this.toDatabase(value)),
                format: 'JSON'
            })
        }
        return values.length
    }

    toDatabase(value: AnyObject): ColumnObject<T> {
        const data: AnyObject = {}
        for (const column of this.columns) {
            if (value.hasOwnProperty(column.name)) {
                data[column.name] = column.transformToDatabase(value[column.name])
            }
            else if (column.isRequired())
                throw new Error('Missing column ' + column.name)
        }
        return data as ColumnObject<T>
    }

    fromDatabase(value: AnyObject): ColumnObject<T> {
        for (const column of this.columns) {
            if (value.hasOwnProperty(column.name)) {
                value[column.name] = column.transformFromDatabase(value[column.name])
            }
            else if (column.isRequired())
                throw new Error('Missing column ' + column.name)
        }
        return value as ColumnObject<T>
    }

    /**
     * Computes the fully-qualified table name by prepending a dataset identifier
     * and possibly appending a version number
     * 
     * @returns 
     */
    getName() {
        if (this.def.dataset != null) {
            if (this.def.version != null) {
                return [ this.def.dataset, this.name, this.def.version ].join('_')
            }
            else return [ this.def.dataset, this.name ].join('_')
        }
        else return this.name
    }

    /**
     * When a table is created without a name in the constructor, this function sets the
     * standard name property in an identical way. This function does not affect the "dataset"
     * prefix or "version" suffix from the definition configuration.
     * 
     * @param name 
     * @returns 
     */
    setName(name: string): this {
        if (name != null)
            this.name = name
        return this
    }

    /**
     * Sets the definition of this table.
     * 
     * @param def 
     * @returns 
     */
    setDefinition(def?: TableDefinition) {
        if (def != null)
            this.def = def
        return this
    }

    /**
     * Returns the table column definition as "(col1 type1, col2 type2, ...)"
     * 
     * @param pretty 
     * @returns 
     */
    getDataDefinition(pretty = false): string {
        const def: string[] = ['(']

        // Add each column's data definition
        for (let i = 0 ; i < this.columns.length ; i++) {
            def.push(this.columns[i].getDataDefinition())
            
            // Commas and new lines if pretty printing
            if (i + 1 < this.columns.length)
                def.push(pretty ? ',\n  ' : ', ')
            else if (pretty)
                def.push('\n')
        }
        def.push(')')
        return def.join('')
    }

    hasPartition() {
        return this.def.partitionBy != null
    }

    getPartitionDefinition() {
        // No partitions, single table
        if (! this.def.partitionBy)
            return 'PARTITION BY tuple()'

        // Partition statement
        return `PARTITION BY ${ 
            Array.isArray(this.def.partitionBy) ? 
                `(${ this.def.partitionBy.join(', ') })` : 
                this.def.partitionBy 
            }`
    }

    hasOrder() {
        return this.def.orderBy != null
    }

    getOrderDefinition() {
        return  `ORDER BY ${ Array.isArray(this.def.orderBy) ? 
                    `(${ this.def.orderBy.join(', ') })` : this.def.orderBy 
                }`
    }

    hasPrimaryKey() {
        return this.def.primaryKey != null
    }

    getPrimaryKeyDefinition() {
        const primaryKey = this.def.primaryKey
        if (! primaryKey) return ''
        return  `PRIMARY KEY (${ Array.isArray(primaryKey) ? primaryKey.join(', ') : primaryKey })`
    }

    /**
     * Return all columns
     * @returns 
     */
    getColumns() {
        return this.columns
    }

    getColumnByName(name: string): Column<any> {
        return this.column[name]
    }

    getColumnByCSV(name: string): Column<any> {
        return this.csv[name]
    }

    hasColumnCSV(name: string): boolean {
        return this.csv[name] != null
    }

    getDefinition() {
        return this.def
    }

    getEngine() {
        return (this.def.engine || 'MergeTree') + '()'
    }

    getClient() {
        return this.db.getClient()
    }

    withEngine(engine: TableEngine): Table {
        return new Table(this.db, this.name, {
            ...this.def,
            engine
        })
    }

    withVersion(version: string): Table {
        return new Table(this.db, this.name, { 
            ...this.def, 
            version: version
        })
    }

    setClass(row: T) {
        this.row = row
    }

    getClass() {
        return this.row
    }

    getAssistantPrompt(): string {
        const prompt: string[] = [
            `There is a ClickHouse table named "${ this.getName() }" with engine "${ this.getEngine() }" with the following columns:`
        ]
        for (const column of this.columns) {
            prompt.push(column.getAssistantPrompt())
        }
        return prompt.join('\n')
    }
}