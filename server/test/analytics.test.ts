import {
    Database,
    Table
} from '..'
import { TableDefinition } from '../../types'

import testAnalytics from './analytics'

describe('Select query test', () => {
    // Set up local database
    const db = Database.local()
    const { PageVisit, generatePageVisits } = testAnalytics(db)
    const table = db.getTable(PageVisit)

    beforeAll(async () => {
        await table.create().ifNotExists().execute()
    })

    it('should insert page visits', async () => {
        const visits = generatePageVisits({ count: 100000 })
        await table.insert(visits, 100)
    })

    afterAll(async () => {
        await db.dropTable(PageVisit).execute()
    })

})