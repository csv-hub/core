import { Table } from '.'

export interface TableErrorClass {
    new(table: Table): Error
}

export class TableExistsError extends Error {

    constructor(table: Table) {
        super(`Table "${ table.getName() }" already exists`)
    }

}

export class TableTransportError extends Error {

    constructor(table: Table) {
        super(`No transport definition for ${ table.getName() }`)
    }
    
}