import { Database, TableExistsError } from '.'

describe('Table error test', () => {
    const db = Database.local()
    const sameTable = db.getTableFromSpecification({ 
        name: 'jest_same_table', 
        definition: { 
            engine: 'MergeTree', 
            primaryKey: 'id' 
        }, 
        column: {
            id: 'String'
        }
    })

    beforeAll(async () => {
        await sameTable.drop().ifExists().execute()
    })
    
    it('should throw an error when creating the same table twice', async () => {
        expect(await sameTable.exists()).toEqual(false)
        await sameTable.create().execute()
        expect(await sameTable.exists()).toEqual(true)

        // Further creations should fail
        try {
            await sameTable.create().execute()
            expect(true).toBe(false)
        }
        catch (error) {
            expect(error).toBeInstanceOf(TableExistsError)
        }
    })

    afterAll(async () => {
        await sameTable.drop().execute()
    })
})