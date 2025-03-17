import { Database } from '..'

describe('Table command test', () => {
    const db = Database.local()


    it('should create and drop tables', () => {
        const table = db.getTableFromSpecification({
            name: 'testdata',
            column: {
                id: 'UUID',
                value: 'UInt16'
            },
            definition: {
                engine: 'MergeTree',
                primaryKey: 'id'
            }
        })

        expect(table.create().toString()).toEqual(
            'CREATE TABLE testdata (id UUID, value UInt16) ENGINE = MergeTree() PARTITION BY tuple() PRIMARY KEY(id)')
        expect(table.create().temporary().toString()).toEqual(
            'CREATE TEMPORARY TABLE testdata (id UUID, value UInt16) ENGINE = MergeTree() PARTITION BY tuple() PRIMARY KEY(id)')
        expect(table.create().ifNotExists().toString()).toEqual(
            'CREATE TABLE IF NOT EXISTS testdata (id UUID, value UInt16) ENGINE = MergeTree() PARTITION BY tuple() PRIMARY KEY(id)')
        expect(table.create().orReplace().toString()).toEqual(
            'CREATE OR REPLACE TABLE testdata (id UUID, value UInt16) ENGINE = MergeTree() PARTITION BY tuple() PRIMARY KEY(id)')
        expect(table.drop().toString()).toEqual(
            'DROP TABLE testdata')
        expect(table.drop().ifExists().toString()).toEqual(
            'DROP TABLE IF EXISTS testdata')
    })

})