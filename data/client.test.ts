import {
    Database,
    Table
} from '.'
import { TableDefinition } from '../types'

describe('ClickHouse client', () => {
    const database = new Database({
        url: 'http://localhost:8123'
    })
    const table = database.getTableFromSpecification({
        name: 'jest_test',
        definition: {
            engine: 'MergeTree',
            orderBy: 'id'
        },
        column: {
            id: 'UInt64',
            x: 'UInt8',
            y: 'UInt8'
        }
    })

    beforeAll(async () => {
        await table.drop().ifExists().execute()
    })

    it('should create a table', async () => {
        await table.create().execute()
        expect(table.getName()).toEqual('jest_test')
    })

    it('should insert into the table', async () => {
        await table.insert([
            { id: 100, x: 0, y: 0 },
            { id: 1000, x: 100, y: 100 }
        ])
    })

    it('should select from the table', async () => {
        const result = await table.selectAll().execute()
    })

    afterAll(async () => {
        await table.drop().execute()
        await database.close()
    })

})