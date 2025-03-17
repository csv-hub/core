import { Database } from '..'

export default function(db: Database) {
    const table = db.tableDecorator()
    const column = db.columnDecorator()

    @table('jest_all_types', {
        engine: 'MergeTree',
        primaryKey: 'id'
    })
    class AllType {
        @column('UUID')
        id: string

        @column('UInt8')
        num: number

        @column('UInt64')
        bignum: BigInt

        @column('Date')
        date: Date

        @column('Enum', { values: ['red', 'green', 'blue'] })
        color: 'red' | 'green' | 'blue'

        @column('DateTime')
        datetime: Date

        @column('Date32')
        date32: Date

        @column('Float32')
        float32: number

        @column('Float64')
        float64: number

        @column('DateTime64')
        date64: Date

        @column('Array', { elementType: 'String' })
        array_str: string[]

        @column('Map', { keyType: 'String', valueType: 'UInt32' })
        map_str_to_num: Map<string, number>
    }



    return { AllType }
}