import { Decimal } from './decimal'

describe('Decimal test', () => {

    it('should parse decimal strings', () => {
        // Default precision is 2
        expect(new Decimal('1.23').toString()).toEqual('1.23')
        expect(new Decimal('1.03').toString()).toEqual('1.03')
        expect(new Decimal('1.').toString()).toEqual('1.00')

        // Variable precision
        expect(new Decimal('1.23', 3).toString()).toEqual('1.230')
        expect(new Decimal('1.23', 1).toString()).toEqual('1.2')
        expect(new Decimal('1.26', 1).toString()).toEqual('1.2')
        expect(new Decimal('1.', 10).toString()).toEqual('1.0000000000')
    })

    it('should add decimals', () => {
        expect(new Decimal('1.1').add(new Decimal('2.2')).toString()).toEqual('3.30')
        expect(new Decimal('1.1', 1).add(new Decimal('2.22', 2)).toString()).toEqual('3.3')
    })

    it('should add decimals of different precision', () => {
        // TODO
    })

    it('should subtract decimals', () => {
        // TODO
    })

    it('should subtract decimals of different precision', () => {
        // TODO
    })

    it('should multiply decimals', () => {
        // TODO
    })

    it('should multiply decimals of different precision', () => {
        // TODO
    })

    it('should divide decimals', () => {
        // TODO
    })

    it('should divide decimals of different precision', () => {
        // TODO
    })
    
})