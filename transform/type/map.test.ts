import { stringToNative } from '..'

describe('Map', () => {

    it('should parse maps', () => {
        const parse = stringToNative.Map({ keyType: 'String', valueType: 'UInt16' })
        expect(parse('foo=1,bar=2')).toEqual(new Map([['foo', 1], ['bar', 2]]))
    })

})