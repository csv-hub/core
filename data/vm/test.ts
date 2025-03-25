import path from 'path'

import { Database } from '..'
import { importDatasetInVM } from './table'

const FEC = path.join(__dirname, '../../../../data/fec');

(async () => {
    const db = Database.local()
    importDatasetInVM(db, FEC)

    for (const table of db.getTables()) {
        if (table.getName() != 'fec_committee') continue

        await table.transport({ 
            destination: path.join(FEC, 'data'), 
            verbose: true,
            useCache: false
        })
    }
})()