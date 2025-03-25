import { Database, Table } from '..'
import { SelectQuery } from './query'

describe('Query test', () => {
    const db = Database.local()
    const table = db.getTable('testdata')

    it('should generate a simple query', () => {
        expect(table.select().allColumns().toString()).toEqual('SELECT * FROM testdata')
    })

    it('should have grouping', () => {
        expect(table.select({ 
            name_lower: 'lower(name)', 
            age: 'age' 
        }).groupBy('name_lower', 'age').toString()).toEqual('SELECT lower(name) AS name_lower, age FROM testdata GROUP BY name_lower, age')
    })

    it('should generate nested selects for querying distinct', () => {
        
        // Applying an expression to determine distinct values using a subquery
        expect(table.select({ name_lower: 'lower(name)' }, 'age')
             .thenSelect('name_lower', 'age')
             .distinct('name_lower')
             .orderBy('name_lower', 'age')
             .descending()
             .toString()).toEqual('SELECT DISTINCT ON (name_lower) name_lower, age FROM (SELECT lower(name) AS name_lower, age FROM testdata) ORDER BY name_lower, age DESC')

    })

    it('should generate except', () => {
        // TODO: except
    })

    it('should apply functions', () => {
        // TODO: applyFunction
    })

    it('should replace column with expressions', () => {
        // TODO: applyFunction
    })

    it('should apply ordering', () => {
        // TODO: applyFunction
    })

})