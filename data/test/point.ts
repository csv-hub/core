import { Database } from '..'

export default function(db: Database) {
    const table = db.tableDecorator()
    const column = db.columnDecorator()

    @table('test_point_x_y')
    class Point {
        @column('UInt16')
        x: number

        @column('UInt16')
        y: number
    }



    return { Point }
}