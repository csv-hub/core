import path from 'path'

import { Database } from '..'
import { importDatasetInVM } from './table'

const FEC = path.join(__dirname, '../../../../data/fec');

(async () => {
    const db = Database.local()
    importDatasetInVM(db, FEC)

    for (const table of db.getTables()) {
        await table.transport({ verbose: false })
    }
})()