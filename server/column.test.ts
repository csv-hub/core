import { Column } from '.'

import { InvalidNumberError } from '../transform/error'

describe('Column test', () => {

    it('should parse numbers', () => {
        const value = new Column('num', 'Int16')
        expect(value.fromString('1')).toEqual(1)
    })

    it('should throw errors on invalid', () => {
        const column = new Column('test', 'UInt8')
        expect(() => column.fromString('abc')).toThrow(InvalidNumberError)
    })

    it('should produce default value if parsing invalid', () => {
        const column = new Column('test', 'UInt8', { defaultValue: 0 })
        
        expect(column.fromString('abc')).toEqual(0)
    })

})