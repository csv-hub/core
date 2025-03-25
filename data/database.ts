'use server'

// Official ClickHouse client
import { ClickHouseClient, createClient } from '@clickhouse/client'

// Table and commands
import { 
    Table
} from '.'

import { 
    ListDatabasesCommand, 
    ListTablesCommand, 
    ListFunctionsCommand,
    ShowTableCommand
} from './command/system'

// Type imports
import type { DatabaseLocation, AnyClass, AnyInstance } from './types'
import type { 
    ColumnType, 
    DefinitionOf, 
    TableDefinition, 
    TableSpecification
} from '../types'

// Decorator types
import type { 
    ColumnDecoratorBuilder, 
    TableDecoratorBuilder
} from '../decorator/types'

/**
 * Represents a specific ClickHouse database. Since Clickizen is designed to work with only
 * a single ClickHouse database at a time, this is the highest level of abstraction around the
 * ClickHouse official client.
 */
export class Database {
    private location: DatabaseLocation

    /**
     * Static mappings of all registered tables by class to table
     */ 
	private tableClass: WeakMap<AnyClass, Table<any>> = new WeakMap()
    private tableName: Map<string, Table<any>> = new Map()
	private tables: Array<Table<any>> = []

    /**
     * Single reference to a ClickHouse client shared by 
     */
    private client: ClickHouseClient

    /**
     * Create a Database reference to a given location
     * @param location 
     */
    constructor(location: DatabaseLocation) {
        this.location = location
        this.client = createClient(location)
    }

    /**
     * @desc        Returns an instance of the local database, useful for testing.
     * @returns 
     */
    static local(location?: DatabaseLocation): Database {
        return new Database({ ...location, url: 'http://localhost:8123' })
    }

    /**
     * @desc        Closes the database connection. 
     * @returns 
     */
    close(): Promise<void> {
        return this.client.close()
    }

    listDatabases() {
        return new ListDatabasesCommand(this)    
    }

    listTables() {
        return new ListTablesCommand(this)
    }

    listFunctions() {
        return new ListFunctionsCommand(this)
    }

    showTable(name: string) {
        return new ShowTableCommand(this)
    }

    /**
     * Gets a table from an object table specification
     * @param spec 
     * @returns 
     */
    getTableFromSpecification(spec: TableSpecification): Table {
        // Return a cached table if 
        const resolved = this.resolveTableName(spec.name, spec.definition)
        if (this.tableName[resolved])
            return this.tableName[resolved]

        // Create a new table with the definition
        const table = new Table(this, spec.name, spec.definition)
        
        // Add each column from the column specification
        for (const name of Object.keys(spec.column)) {
            const def = spec.column[name]
            if (typeof def === 'string')
                table.addColumn(name, def, {})
            else
                table.addColumn(name, def.type, def)
        }
        
        return table
    }

    getTables(): Table[] {
        return this.tables
    }

    getTable<T extends AnyClass>(name: string | T, def?: TableDefinition): Table<T> {
        return this.cachedTable(name, def)
    }

    /**
     * Returns true if the given table is registered with this database client.
     * 
     * @param name 
     * @param def 
     * @returns 
     */
    hasTable(name: string | AnyClass, def?: TableDefinition): boolean {
        if (typeof name === 'string') {
            const resolved = this.resolveTableName(name, def)
            return this.tableName[resolved] != null
        }
        // Check class mapping for table definition
        return this.tableClass.has(name)
    }

    // TABLE COMMANDS
    // These functions produce instances of TableCommand
    // @see command

    /**
     * Create a new table from a name and definition, or from a class specification
     * to a table loaded by decorators.
     */
    createTable<T extends AnyClass>(name: string | T, def?: TableDefinition) {
        return this.cachedTable(name, def).create()
    }

    dropTable<T extends AnyClass>(name: string | T, def?: TableDefinition) {
        return this.cachedTable(name, def).drop()
    }

    resolveTableName(name: string, def?: TableDefinition) {
        if (! def) return name
        if (def.dataset) {
            // Historical dataset version
            if (def.version)
                return [ def.dataset, name, def.version ].join('_')
            // The default table name contains the latest dataset
            else return [ def.dataset, name ].join('_')
        }
        return name
    }

    private cachedTable<T extends AnyClass>(name: string | T, def?: TableDefinition): Table<T> {
        if (typeof name === 'string') {
            const resolved = this.resolveTableName(name, def)
        
            if (this.tableName[resolved])
                return this.tableName[resolved]
            return this.tableName[resolved] = new Table<T>(this, name, def)
        }
        else if (this.tableClass.has(name)) {
            return this.tableClass.get(name) as Table<T>
        }
        else throw new Error('Table ' + name + ' is not registered')
    }

    loadTables(dirname: string) {
        // fs.readdirSync(dirname)
    }

    /**
     * Loads any table definitions from the file by running it within a VM script
     * @param filename - a compiled table specification
     */
    loadTable(filename: string) {
        
    }

    /**
     * Call the function above to add the table by class.
     * @returns 
     */
    tableDecorator(): TableDecoratorBuilder {
        const db = this
        return function(name: string, def?: TableDefinition) {
            return ((target: AnyClass) => db.addTableByClass(target, name, def)) as ClassDecorator
        }
    }

    columnDecorator(): ColumnDecoratorBuilder {
        const db = this
        return function<T extends ColumnType>(type: T, def?: DefinitionOf<T>) {
            return (target: AnyInstance, name: string) => db.addColumnByInstance(target, name, type, def)
        }
    }

    private addTableByClass(target: AnyClass, name?: string, def?: TableDefinition) {
        // If this class extends a class associated with another table
        let parent: Table | undefined

        // Detect inheritance
        const prototype = Object.getPrototypeOf(target)
        if (this.tableClass.has(prototype)) {

            // Inherit the definition from the parent, and overwrite keys with values specified in
            // this child class definition
            parent = this.tableClass.get(prototype)
            def = Object.assign({}, parent.getDefinition(), def)
        }

        if (this.tableClass.has(target)) {
            const table = this.tableClass.get(target)
            table.setName(name)
            table.setDefinition(def)
            table.addColumnsFrom(parent)
            return target
        }

        const table = new Table(this, name, def, target)
        table.addColumnsFrom(parent)
        
        this.tableClass.set(target, table)
        this.tableName[this.resolveTableName(name, def)] = table
        this.tables.push(table)

        return target
    }

    /**
     * 
     * @param target 
     * @param name 
     * @param type 
     * @param def 
     */
    private addColumnByInstance<T extends ColumnType>(target: AnyInstance, name: string, type: T, def?: DefinitionOf<T>): void {
        // TODO: validate target class
        const targetClass = target.constructor as AnyClass
        if (! this.tableClass.has(targetClass))
            this.addTableByClass(targetClass)

        // Add the column definition to the table targeted by the class
        this.tableClass.get(targetClass).addColumn(name, type, def)
    }

    materializedDecorator() {
        // TODO: class decorator
        // return factory builder for select query
    }

    /**
     * Used by Table instances and associated queries for making requests to ClickHouse
     * if they have a reference to a database.
     * 
     * @returns 
     */
    getClient(): ClickHouseClient {
        return this.client
    }

    /**
     * Returns the database name, or "default" if not specified.
     * @returns 
     */
    getName() {
        return this.location.database || 'default'
    }

    async getClickHouseVersion(): Promise<string | null> {
        try {
            const result = await this.client.query({
                query: 'SELECT version()',
                format: 'JSON'
            })
            const json = await result.json()
            return json.data[0]['version()']
        }
        catch (error) {
            return null
        }
    }
}