import { Database } from '..'

export default function(db: Database) {
    const table = db.tableDecorator()
    const column = db.columnDecorator()
    
    @table('trips', {
        engine: 'MergeTree',
        partitionBy: 'toYYYYMM(pickup_date)',
        orderBy: 'pickup_datetime'
    })
    class Trip {

    }

    return Trip
}