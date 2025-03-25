import { Database } from '..'
import {
    AlterColumnCommand
} from './column'

describe('Column command', () => {
    const db = Database.local()


    it('should generate alter statements', () => {
        const alter = new AlterColumnCommand(db.getTable('testdata'), 'testcol')
        expect(alter.rename('anothercol').toString()).toEqual('ALTER TABLE testdata RENAME COLUMN testcol TO anothercol')
    })
})