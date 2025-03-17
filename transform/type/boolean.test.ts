import { stringToBoolean } from './boolean'

describe('Boolean test', () => {

    it('should parse booleans', () => {
        const parse = stringToBoolean()({})
        expect(parse('true')).toEqual(true)
        expect(parse('false')).toEqual(false)
    })

    it('should parse trueValue and falseValue', () => {
        const parse = stringToBoolean()({ trueValue: 'Y', falseValue: 'N' })
        expect(parse('Y')).toEqual(true)
        expect(parse('N')).toEqual(false)
    })

})