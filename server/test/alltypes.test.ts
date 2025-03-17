import crypto from 'crypto'

import { Database } from '..'
import testAllTypes from './alltypes'
import { AnyObject } from '../types'

describe('All types test', () => {
    const db = Database.local()
    const { AllType } = testAllTypes(db)
    const table = db.getTable(AllType)

    beforeAll(async () => {
        await table.create().ifNotExists().execute()
    })

    it('should create all types', async () => {
        const value = {
            id: crypto.randomUUID(),
            num: 255,
            color: 'red' as 'red' | 'green' | 'blue',
            map_str_to_num: new Map([ ['foo', 1], ['bar', 2] ]),
            bignum: BigInt('1234'),
            array_str: ['foo', 'bar', 'baz', 'quux'],
            date: new Date(),
            datetime: new Date(),
            date32: new Date(),
            date64: new Date(),
            float32: 1.23,
            float64: 1.23
        }
        // TODO:
        // - floats
        // - decimals
        // - IP addresses
        // - arrays of complex specs
        // - map of complex spec

        // console.log('value', value)
        // console.log('before', table.toDatabase(value))

        await table.insert([ value ])

        const result = await table.selectAll().execute()
        const retrieved = result.data[0] as AnyObject
        // console.log('after', retrieved)

        // retrieved.datetime = Math.round(new Date(retrieved.datetime).getTime() / 1000)
        // retrieved.date64 = new Date(retrieved.date64).getTime()

        // console.log('parsed', table.fromDatabase(retrieved))
    })

    afterAll(async () => {
        await table.drop().ifExists().execute()
    })

})