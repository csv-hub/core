
/**
 * Provides a native JavaScript representation for Decimal type numbers that maintains precision.
 * Currently parsing to this type is only enabled when the "precise" flag is set to true in the
 * DecimalDefinition object associated with the type.
 */
export class Decimal {
    // Upper and lower values
    upper: number
    lower: number = 0
    
    private precision: number
    private resolution: number

    constructor(value: string | number | number[], precision: number = 2) {
        this.precision = precision
        this.resolution = 10 ** precision

        if (Array.isArray(value)) {
            this.upper = value[0]
            this.lower = value[1]
        }
        else if (typeof value === 'string') {
            if (! value.trim().match(/^\d+(\.\d*|)$/))
                throw new Error('Invalid decimal')

            const dot = value.indexOf('.')
            this.upper = parseInt(value.substring(0, dot))

            const lower = value.substring(dot + 1, dot + 1 + precision)
            this.lower = parseInt(lower)
            if (isNaN(this.lower))
                this.lower = 0
            else if (lower.length < precision)
                this.lower *= 10 ** (precision - lower.length)
        }
        else if (typeof value === 'number') {
            this.upper = Math.floor(value)
            this.lower = Math.round(10 ** precision * (value - this.upper))
        }
    }

    add(other: Decimal): Decimal {
        // Match lower part of decimal if precision is different
        let lower: number
        if (this.precision < other.precision)
            lower = this.lower + Math.round(other.lower / 10 ** (other.precision - this.precision))
        else if (this.precision > other.precision)
            lower = this.lower + other.lower * 10 ** (this.precision - other.precision)
        else lower = this.lower + other.lower
        const overflow = Math.floor(lower / this.resolution)

        // Return a new Decimal instance with the sum
        return new Decimal([
            this.upper + other.upper + overflow,
            lower % this.resolution
        ], this.precision)
    }

    toString() {
        const dec: string[] = [ this.upper.toFixed(0), '.']
        let lower = this.lower.toFixed(0)
        if (lower.length < this.precision)
            dec.push(new Array(this.precision - lower.length).fill('0').join(''))
        dec.push(lower)
        return dec.join('')
    }
}

// TODO: same definition but with BigInts
export class BigDecimal {
    upper: BigInt
    lower: BigInt

    constructor(value: string | number) {

    }
}