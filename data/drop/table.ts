import { Table } from '..'

export class DropTable {
    table: Table

    constructor(table: Table) {
        this.table = table
    }

    toString() {
        return `DROP TABLE IF EXISTS ${ this.table.getName() }`
    }

    async execute() {
        const result = await this.table.getClient().command({
            query: this.toString()
        })

        // console.log('drop result', result)
    }

}