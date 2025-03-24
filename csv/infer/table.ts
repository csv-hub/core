import type { Table } from '../../server'
import { ColumnInference } from '.'

/**
 * Performs inference on a table.
 */
export class TableInference {
    table: Table
    column: Record<string, ColumnInference> = {}
    columns: ColumnInference[] = []

    constructor(table: Table) {
        this.table = table

        for (const column of table.getColumns()) {
            this.column[column.name] = new ColumnInference(table, column)
        }
    }

}