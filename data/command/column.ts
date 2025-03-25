import type { ColumnType, DefinitionOf } from '../../types'
import type { Table } from '..'

import { 
    getColumnTypeDefinition
} from '../../transform'

export class ColumnCommand {
    protected table: Table
    protected name: string

    constructor(table: Table, name: string) {
        this.table = table
        this.name = name
    }

    async execute() {
        this.table.getClient().command({
            query: this.toString()
        })
    }
}

/**
 * @class   AlterTableCommand
 * 
 */
export class AlterColumnCommand extends ColumnCommand {
    newName?: string
    
    action?: 'RENAME' | 'ADD' | 'MODIFY' | 'DROP'
    type?: ColumnType
    def?: DefinitionOf<ColumnType>

    rename(newName: string) {
        this.action = 'RENAME'
        this.newName = newName
        return this
    }

    add<T extends ColumnType>(type: T, def?: DefinitionOf<T>) {
        this.action = 'ADD'
        this.type = type
        this.def = def
        return this
    }

    modify<T extends ColumnType>(type: T, def?: DefinitionOf<T>) {
        this.action = 'MODIFY'
        this.type = type
        this.def = def
        return this
    }

    drop() {
        this.action = 'DROP'
        return this
    }

    toString() {
        if (! this.action)
            throw new Error('Column command must specify an action')

        const command: string[] = [ 'ALTER TABLE ', this.table.getName(), ' ', this.action, ' COLUMN ', this.name ]
        switch (this.action) {
        case 'ADD': 
        case 'MODIFY': command.push(' ', getColumnTypeDefinition(this.type, this.def)); break
        case 'RENAME': command.push(' TO ', this.newName); break
        }
        return command.join('')
    }

}