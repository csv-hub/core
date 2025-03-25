import { Database } from '.'

import analyticsTest from './test/analytics'

describe('Database test', () => {
    const db = Database.local()

    it('should connect to a local database', async () => {
        expect(await db.getClickHouseVersion()).toMatch(/^\d+(\.\d+)+$/)
    })

    it('should allow inheritance', async () => {
        // TODO: load inherited test classes
        const { PageVisit, SummingPageVisit } = analyticsTest(db)
        const t1 = db.getTable(PageVisit)
        const t2 = db.getTable(SummingPageVisit)

        expect(t1.getColumns().length).toEqual(t2.getColumns().length)
    })

})