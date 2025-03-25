import { Database } from '..'
import testVectors from './vectors'

describe('Vectors test', () => {
    const db = Database.local()
    const { VectorWithId, generateVectorsWithId } = testVectors(db)
    const table = db.getTable(VectorWithId)
    const TOTAL_CREATED = 1000

    beforeAll(async () => {
        await table.create().ifNotExists().execute()
    })

    it('should store vectors', async () => {
        const vectors = generateVectorsWithId(TOTAL_CREATED, 100)
        await table.insert(vectors, 100)
    })

    it('should query vectors', async () => {
        const start = Date.now()
        let read = 0
        let offset = 0
        
        const stream = await table.selectAll().stream()
        for await (const rows of stream) {
            for (const row of rows) {
                read++
                // console.log(row.json())
            }
        }

        console.log(`Read all in ${ Date.now() - start } ms`)
        expect(read).toEqual(TOTAL_CREATED)
    })

    afterAll(async () => {
        await table.drop().ifExists().execute()
    })
})