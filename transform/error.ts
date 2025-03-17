
import { ColumnType, DefinitionOf } from '../types'

export class ColumnError extends Error {
    code: string

    constructor(code: string) {
        super('field error')
        this.code = code
    }

    toString() {
        return 'chalk error TODO'
    }

}

export class InvalidNumberError extends ColumnError {
    value: any

    constructor(value: any) {
        super('invalid_number')
        this.value = value
    }

}

export class InvalidEnumValueError extends ColumnError {
    value: string
    values: Set<string>

    constructor(value: string, values: Set<string>) {
        super('invalid_enum_value')
        this.value = value
        this.values = values
    }
}

export class InvalidDateError extends ColumnError {
    value: string
    format?: string

    constructor(value: string, format?: string) {
        super('invalid_date')
        this.value = value
        this.format = format
    }

}

export class LowerBoundError extends ColumnError {
    value: number | BigInt
    bound: number | BigInt

    constructor(value: number | BigInt, bound: number | BigInt) {
        super('lower_bound')
        this.value = value
        this.bound = bound
    }

}

export class UpperBoundError extends ColumnError {
    value: number | BigInt
    bound: number | BigInt

    constructor(value: number | BigInt, bound: number | BigInt) {
        super('lower_bound')
        this.value = value
        this.bound = bound
    }

}