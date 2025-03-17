import { 
    stringToInteger,
    stringToFloat,
    stringToBigInt
} from './number'

import {
    UpperBoundError
} from '../error'

describe('Number parsing test', () => {

    it('should parse Int8 and UInt8', () => {
        const int8 = stringToInteger(8)({})
        const uint8 = stringToInteger(8, true)({})

        expect(int8('123')).toEqual(123)
        expect(uint8('123')).toEqual(123)

        // Test upper bounds
        expect(int8('127')).toEqual(127)
        expect(() => int8('128')).toThrow(UpperBoundError)
        expect(() => uint8('256')).toThrow(UpperBoundError)
    })

    it('should parse floats', () => {
        // TODO
    })

    it('should parse BigInts', () => {
        // TODO
    })
})