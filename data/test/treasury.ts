import { Database } from '..'

export default function(db: Database) {
    const table = db.tableDecorator()
    const column = db.columnDecorator()

    @table('test_treasury', {
        orderBy: 'date',
        primaryKey: 'date',
        csv: 'us_treasury.csv'
    })
    class TreasuryRate {
        @column('Date')
        date: Date

        @column('Decimal', { csv: '1_month', scale: 2, precision: 5 })
        month_1: number

        @column('Decimal', { csv: '2_month', scale: 2, precision: 5 })
        month_2: number

        @column('Decimal', { csv: '3_month', scale: 2, precision: 5 })
        month_3: number

        @column('Decimal', { csv: '6_month', scale: 2, precision: 5 })
        month_6: number

        @column('Decimal', { csv: '1_year', scale: 2, precision: 5 })
        year_1: number

        @column('Decimal', { csv: '2_year', scale: 2, precision: 5 })
        year_2: number

        @column('Decimal', { csv: '3_year', scale: 2, precision: 5 })
        year_3: number

        @column('Decimal', { csv: '5_year', scale: 2, precision: 5 })
        year_5: number

        @column('Decimal', { csv: '7_year', scale: 2, precision: 5 })
        year_7: number

        @column('Decimal', { csv: '10_year', scale: 2, precision: 5 })
        year_10: number

        @column('Decimal', { csv: '20_year', scale: 2, precision: 5 })
        year_20: number

        @column('Decimal', { csv: '30_year', scale: 2, precision: 5 })
        year_30: number

    }

    return { TreasuryRate }
}