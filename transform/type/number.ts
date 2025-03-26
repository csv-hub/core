import {
    DecimalColumnType,
    DecimalDefinition,
    FloatColumnType,
    IntegerColumnType,
    NativeBigIntType,
    NumberColumnType,
    NumberDefinition
} from '../../types'

import {
    ColumnTypeTransform,
    ColumnTransformBuilder,    
    ColumnTransformNativeBuilder
} from '../types'

import {
    InvalidNumberError,
    LowerBoundError,
    UpperBoundError
} from '../error'

/**
 * Parses an integer
 * 
 * @param bits 
 * @param unsigned 
 * @returns 
 */
export function stringToInteger(bits: number, unsigned: boolean = false): ColumnTransformBuilder<IntegerColumnType> {
    const bound = 2 ** bits
    const upper = unsigned ? bound : (bound / 2)
    const lower = unsigned ? 0 : (bound / -2)       // inclusive lower boundary

    return function(def: NumberDefinition) {
        const upperBound = def.max != null ? Math.min(upper, def.max) : upper
        const lowerBound = def.min != null ? Math.max(lower, def.min) : lower

        return function(value: string): number {
            let parsed = parseInt(value)
            if (isNaN(parsed))
                throw new InvalidNumberError(parsed)
            
            // Option for targeting dirty values
            if (def.removeSign && parsed < 0)
                parsed *= -1

            // Boundary checks
            if (parsed < lowerBound)
                throw new LowerBoundError(parsed, lowerBound)
            if (parsed >= upperBound)
                throw new UpperBoundError(parsed, upperBound)

            // Return a validated number
            return parsed
        }
    }
}

export function integerToString<T extends IntegerColumnType>(): ColumnTransformNativeBuilder<T, string> {
    return function (def: NumberDefinition) {
        return (value: number | BigInt) => value.toString()
    }
}

export function integerTypeDefinition(type: IntegerColumnType) {
    return type
}

/**
 * Parses a floating point number
 * @returns 
 */
export function stringToFloat(): ColumnTransformBuilder<FloatColumnType> {
    return function() {
        return function(value: string): number {
            const parsed = parseFloat(value)
            if (isNaN(parsed))
                throw new InvalidNumberError(value)
            return parsed
        }
    }
}

export function floatToString(): ColumnTransformNativeBuilder<FloatColumnType> {
    return function() {
        return (value: number) => value.toString()
    }
}

export function floatTypeDefinition(type: FloatColumnType) {
    return type
}

export function stringToDecimal(): ColumnTransformBuilder<DecimalColumnType> {

    return function(def: DecimalDefinition) {
        // TODO: if (def.precise) return function() {  // new Decimal(...) }

        return function(value: string): number {
            const parsed = parseFloat(value)
            if (isNaN(parsed))
                throw new InvalidNumberError(value)
            return parsed
        }
    }
}

export function decimalToString(): ColumnTransformNativeBuilder<DecimalColumnType> {
    return function(def: DecimalDefinition) {
        return (value: number) => value.toFixed(def.precision)
    }
}

export function decimalTypeDefinition(type: DecimalColumnType, def: DecimalDefinition) {
    if (type == 'Decimal') {
        if (def.precision != null)
            return `${ type }(${ def.precision }${ def.scale != null ? (', ' + def.scale) : '' })`
        else return type
    }
    if (def.scale != null)
        return `${ type }(${ def.scale })`
    // Default to 2 decimal places of precision
    else return `${ type }(2)`
}

/**
 * Parses a BigInt value
 * @param bits 
 * @param unsigned 
 * @returns 
 */
export function stringToBigInt(bits: number, unsigned: boolean = false): ColumnTransformBuilder<NativeBigIntType> {
    const bound = BigInt(2) ** BigInt(bits)
    const upper = unsigned ? bound : (bound / BigInt(2))
    const lower = unsigned ? BigInt(0) : (bound / BigInt(-2))

    return function ({ removeSign }: NumberDefinition) {
        // TODO: BigInt upper and lower bound from definition

        return function(value: string): BigInt {
            if (removeSign && value.startsWith('-'))
                value = value.substring(1)
            
            try {
                const parsed = BigInt(value)
                if (parsed < lower)
                    throw new LowerBoundError(parsed, lower)
                return parsed
            }
            catch (error) {
                throw new InvalidNumberError(value)
            }
        }
    }
}

export function bigIntToString(): ColumnTransformNativeBuilder<NativeBigIntType> {
    return function(def: NumberDefinition) {
        return (value: BigInt) => value.toString()
    }
}