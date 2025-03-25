import { 
    Table,
    // Command errors
    TableExistsError
} from '..'

// Types
import { AnyClass } from '../types'

/**
 * The base class for table commands.
 */
export class TableCommand {
    table: Table

    // Mapping of error handlers from the error type produced by ClickHouse
    // to a custom error class which can carry more specific information about the issue.
    errorHandler: { [key: string]: AnyClass } = {}

    /**
     * All table commands require a reference to the table being operated on.
     * @param table 
     */
    constructor(table: Table) {
        this.table = table
    }

    async execute() {
        try {
            const result = await this.table.getClient().command({
                query: this.toString()
            })
        }
        catch (error) {
            // Custom error handler
            if (typeof error === 'object' && this.errorHandler[error.type])
                throw new this.errorHandler[error.type](this.table)
            else throw error
        }
        return this.table
    }

    /**
     * Execute the table command and return the result.
     * @returns 
     */
    async result() {
        try {
            const result = await this.table.getClient().query({
                query: this.toString(),
                format: 'JSON'
            })
            return await result.json()
        }
        catch (error) {
            throw error
        }
    }

    handleError(type: string, error: AnyClass) {
        this.errorHandler[type] = error
        return this
    }
}

/**
 * CREATE TABLE [name] ...
 */
export class CreateTableCommand extends TableCommand {
    private createOrReplace?: boolean
    private createIfNotExists?: boolean
    private isTemporary?: boolean

    constructor(table: Table) {
        super(table)
        this.handleError('TABLE_ALREADY_EXISTS', TableExistsError)
    }
    
    orReplace(): this {
        this.createOrReplace = true
        return this
    }

    ifNotExists(): this {
        this.createIfNotExists = true
        return this
    }

    temporary(): this {
        this.isTemporary = true
        return this
    }

    toString(pretty = false) {
        // CREATE [OR REPLACE] TABLE test
        const query: string[] = ['CREATE ']
        if (this.isTemporary)
            query.push('TEMPORARY ')
        else if (this.createOrReplace)
            query.push('OR REPLACE ')
        query.push('TABLE ')
        if (this.createIfNotExists)
            query.push('IF NOT EXISTS ')
        query.push(this.table.getName())

        // Add the data definition of the columns
        query.push(' ', this.table.getDataDefinition(pretty))
        query.push(pretty ? '\n' : ' ')

        // Add the table engine
        query.push('ENGINE = ')
        query.push(this.table.getEngine())

        // Define partitioning
        query.push(pretty ? '\n' : ' ')
        query.push(this.table.getPartitionDefinition())

        // Define table ordering
        if (this.table.hasOrder()) {
            query.push(pretty ? '\n' : ' ')
            query.push(this.table.getOrderDefinition())
        }

        if (this.table.hasPrimaryKey()) {
            query.push(pretty ? '\n' : ' ')
            query.push(this.table.getPrimaryKeyDefinition())
        }

        return query.join('')
    }

}

export class ExistsTableCommand extends TableCommand {

    toString() {
        return `EXISTS ${ this.table.getName() }`
    }
}

export class DescribeTableCommand extends TableCommand {
//     SELECT 
//     database, 
//     table, 
//     total_rows, 
//     total_bytes/1024/1024 AS size_MB
// FROM system.parts
// WHERE active = 1 AND database = 'your_database' AND table = 'your_table';
}

export class TruncateTableCommand extends TableCommand {
    toString() {
        return `TRUNCATE TABLE ${ this.table.getName() }`
    }
}

export class OptimizeTableCommand extends TableCommand {
    

    deduplicate() {
        return this
    }

    deduplicateBy(exprs: string[], except?: string[]) {
        return this
    }

    toString() {
        return `OPTIMIZE TABLE ${ this.table.getName() } FINAL`
    }

}

export class DropTableCommand extends TableCommand {
    private dropIfExists?: boolean

    ifExists() {
        this.dropIfExists = true
        return this
    }

    toString() {
        return `DROP TABLE ${ 
            this.dropIfExists ? 'IF EXISTS ' : ''
        }${ this.table.getName() }`
    }

}