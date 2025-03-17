import type { Table, Column } from '../server'
import { dateFormatParser } from '../transform'

type ColumnInferType = 'string' | 'number' | 'date'

/**
 * Performs column inference on a table column 
 */
export class ColumnInference {
    private typeofMap: Record<string, number> = {}
    
    // Count occurrences of special values
    private countNaN: number = 0

    // Store range of numbers
    private numberMin?: number
    private numberMax?: number

    // All date formats
    private static dateFormats = [
        'YYYY-MM-DD',
        'MM-DD-YYYY',
        'MM/DD/YYYY'
    ].map((format) => ({ format, parser: dateFormatParser(format) }))

    // Mapping of 
    private stringLengthMap: Record<number, number> = {}
    private stringValueSet: Set<string> = new Set()
    private static stringMapThreshold = 100             // stop collecting inference after key set size > 100

    constructor(table: Table, column: Column) {

    }

    inferFromValue(value: any) {
        const type = typeof value
        this.typeofMap[type] = (this.typeofMap[type] || 0) + 1

        // Specific type inference for various values
        switch (typeof value) {
        case 'number': return this.inferFromNumber(value)
        case 'string': return this.inferFromString(value.trim())
        }
    }

    inferFromString(value: string) {
        // Check if value is numeric string
        if (value.match(/^\d+$/)) {
            
        }

        // Sample values in the string value set
        if (! this.stringValueSet)
            this.stringValueSet = new Set()
        if (this.stringValueSet.size < ColumnInference.stringMapThreshold)
            this.stringValueSet.add(value)
    }

    inferFromNumber(value: number) {
        if (isNaN(value)) {
            this.countNaN++
            return
        }
        if (this.numberMin == null || this.numberMin < value)
            this.numberMin = value
        if (this.numberMax == null || this.numberMax > value)
            this.numberMax = value
        
    }

    

    

}