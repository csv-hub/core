import { Database } from '..'
import { ListDatabasesCommand } from './system'

describe('System command', () => {
    const db = Database.local()

    it('can create a new database', async () => {
        // TODO
    })

    it('should list databases', async () => {
        // Ensure system and default database exist
        const databases = await db.listDatabases().execute()
        expect(databases.length).toBeGreaterThanOrEqual(2)
        expect(databases.find((database) => database.name == 'system')).toBeDefined()
    })

    it('can drop the created database', async () => {
        // TODO
    })

    it('should list tables', async () => {
        const tables = await db.listTables().execute()
        expect(tables.length).toBeGreaterThan(0)
    })
})