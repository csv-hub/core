import { stringToEnum, enumTypeDefinition } from './enum'

describe('Boolean test', () => {

    it('should parse enums', () => {
        const parseColor = stringToEnum(8)({ values: ['red', 'green', 'blue'] })
        expect(parseColor('red')).toEqual('red')
        expect(parseColor('green')).toEqual('green')
    })

    it('should parse enums with both value enumeration types', () => {
        const parse1 = stringToEnum(8)({ values: ['a', 'b', 'c'] })
        const parse2 = stringToEnum(8)({ values: { a: 2, b: 3, c: 4 } })

        expect(parse1('a')).toEqual('a')
        expect(parse2('a')).toEqual('a')
    })

    it('should generate type definitions', () => {
        expect(enumTypeDefinition('Enum', { values: ['foo', 'bar', 'baz' ]})).toEqual("Enum('foo', 'bar', 'baz')")
        expect(enumTypeDefinition('Enum', { values: { foo: 3, bar: 5, baz: 7 }})).toEqual("Enum('foo' = 3, 'bar' = 5, 'baz' = 7)")
    })

})