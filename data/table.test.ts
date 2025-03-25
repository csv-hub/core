import { Database, Table } from '.'

describe('Table', () => {

    it('should get a scoped name', () => {
        const db = Database.local()
        const t1 = new Table(db)
        expect(t1.getName()).toEqual('')
        t1.setName('table')
        expect(t1.getName()).toEqual('table')

        const t2 = new Table(db, 'testing')
        expect(t2.getName()).toEqual('testing')

        const t3 = new Table(db, 'stuff', { dataset: 'my' })
        expect(t3.getName()).toEqual('my_stuff')

        const t4 = new Table(db, 'stuff', { dataset: 'my', version: '250101' })
        expect(t4.getName()).toEqual('my_stuff_250101')
    })

})