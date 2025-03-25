import { Database, Table } from '.'

import pointTest from './test/point'

describe('Decorator test', () => {
    const db = Database.local()
    const { Point } = pointTest(db)

    it('should populate the database table registry', () => {
        expect(Point).toBeDefined()
        expect(db.hasTable(Point)).toBe(true)
        expect(db.getTable(Point)).toBeInstanceOf(Table)
        expect(db.getTable(Point).getColumns().length).toEqual(2)
        
    })

    it('should load decorator definitions from file', () => {
        // TODO: test loading from file
        // db.loadTableFromFile(...)
    })
})