import path from 'path'

import { Database } from '..'
import testTreasury from './treasury'
import { streamInsertCSV } from '../../csv/stream'

const ratesDir = path.join(__dirname, '../../sandbox/treasury_rates')

describe('Treasury data test', () => {
    const db = Database.local()
    const { TreasuryRate } = testTreasury(db)
    const table = db.getTable(TreasuryRate)

    beforeAll(async () => {
        await table.create().orReplace().execute()
        const start = Date.now()
        const csvFile = path.join(ratesDir, 'us_treasury.csv')
        // await table.insertFromCSV(csvFile)
        
        // await table.insertFromCSV()
        await streamInsertCSV(table, csvFile, 100)
        console.log('Imported in ' + (Date.now() - start) + ' ms')
    })

    it('should allow queries on the data', () => {
        console.log(table.getAssistantPrompt())
    })

    afterAll(async () => {
        // await db.dropTable(TreasuryRate).ifExists().execute()
    })

})