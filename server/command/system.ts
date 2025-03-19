import { ResponseJSON } from '@clickhouse/client'

import { Database, Table } from '..'
import type { 
    AnyObject, 
    ClickHouseDatabase,
    ClickHouseTable
} from '../types'

export abstract class SystemCommand<D> {
    db: Database

    constructor(db: Database) {
        this.db = db
    }

    abstract parse(result: ResponseJSON<any>): D;

    async execute(): Promise<D> {
        const result = await this.db.getClient().query({
            query: this.toString(),
            format: 'JSON'
        })
        const json = await result.json()
        return this.parse(json)
    }

}

/**
 * List all databases
 */
export class ListDatabasesCommand extends SystemCommand<ClickHouseDatabase[]> {

    toString() {
        return `SELECT * from system.databases`
    }

    parse(result: ResponseJSON) {
        return result.data as ClickHouseDatabase[]
    }
}

// List all tables in a database without creating Table instances
// SELECT * FROM system.tables WHERE database = 'system';
export class ListTablesCommand extends SystemCommand<ClickHouseTable[]> {
    databaseName: string = 'default'

    forDatabase(databaseName: string) {
        this.databaseName = databaseName
    }

    parse({ data }) {
        return data as ClickHouseTable[]
    }

    toString() {
        return `SELECT * from system.tables WHERE database = '${ this.databaseName }'`
    }

}

export class ShowTableCommand extends SystemCommand<any> {

    toString() {
        return `SHOW TABLE test_treasury`
    }

    parse({ data }) {
        console.log(data)
        return data
    }

}


export class ListFunctionsCommand extends SystemCommand<string[]> {

    toString() {
        return `SELECT * from system.functions`
    }

    parse(result) {
        console.log(result)
        return []
    }

}

// Get disk space usage
// SELECT name, path, free_space, formatReadableSize(free_space), total_space FROM system.disks;

// Get mergetree engines
// SELECT database, table, engine, primary_key, sorting_key FROM system.tables 
// WHERE engine LIKE '%MergeTree%' AND database = 'your_database';


// Show ongoing merge operations
// SELECT database, table, elapsed, progress FROM system.merges 
// WHERE database = 'default';

// Get table replication status
// SELECT database, table, is_leader, absolute_delay, queue_size FROM system.replicas
// WHERE database = 'your_database';