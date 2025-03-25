import fs from 'fs'
import path from 'path'
import stream from 'stream'
import csv from 'csv-parser'

import type { Table, Column, AnyClass, AnyObject } from '../data'
import { CSVRow, CSVRowReader, CSVHeaderMapper, CSVValueMapper, CSVErrorLog } from './types'

export class CSVFile {
    filename: string
    
    // Characters for delimiting values
    separator = ','
    escape = '"'
    newline = '\n'

    // Sets the stream buffer to this size multiplied by 1024
    streamBufferSize?: number

    /**
     * If false, indicates that there are no headers on this CSV file. If a string array is provided,
     * the CSV file is assumed to have no headers and columns mapping to the specified headers.
     */
    headers?: boolean | string[]

    /**
     * If error tracking is enabled, an object will be initialized here
     */
    errorLog?: CSVErrorLog

    /**
     * @desc    Constructs a "symbolic CSV file" which can be streamed into other data sources or directly read.
     * 
     * @param filename 
     */
    constructor(filename: string) {
        this.filename = filename
    }

    async infer() {
        // run inference on columns
    }

    /**
     * 
     * @param callback 
     * @returns 
     */
    read(callback: {
        onRow?: CSVRowReader, 
        onEnd?: (stream: stream.Transform) => any,
        onError?: (error: any, stream: stream.Transform) => any,
        mapHeader?: CSVHeaderMapper,
        mapValue?: CSVValueMapper
    }): stream.Transform {
        // Set defaults for certain functions if not provided
        callback.onRow = callback.onRow || (() => {})
        callback.onEnd = callback.onEnd || (() => {})
        callback.onError = callback.onError || (() => {})

        // Create a read stream for the file
        const stream = fs.createReadStream(this.filename, {
            highWaterMark: this.streamBufferSize ? (this.streamBufferSize * 1024) : undefined
        })
        .pipe(csv({
            separator: this.separator,
            headers: this.headers,
            escape: this.escape,
            newline: this.newline,
            mapHeaders: callback.mapHeader ? (({ header, index }) => callback.mapHeader(header, index)) : ({ header }) => header,
            mapValues: callback.mapValue ? (({ header, value, index }) => callback.mapValue(header, value, index)) : ({ value }) => value
        }))
        .on('data', (data) => callback.onRow(data, stream))
        .on('end', () => callback.onEnd(stream))
        .on('error', (error) => callback.onError(error, stream))

        return stream
    }

    /**
     * Transform a TSV or arbitrarily-delimited file into a standard CSV
     * @param { string[] } transform.addHeader - add headers to the file
     * @param destination 
     * @returns 
     */
    async transform({ addHeader, mapSeparator }: { addHeader?: string[], mapSeparator?: string }, destination: string): Promise<string> {
        const csv = this
        
        return new Promise((resolve, reject) => {
            csv.headers = addHeader
            csv.separator = mapSeparator
            
            fs.mkdirSync(path.dirname(destination), { recursive: true })
            const writeStream = fs.createWriteStream(destination)
            let headerIndex: string[] = []
            let rowLength = (addHeader ? addHeader.length : 0)

            if (addHeader) {
                writeStream.write(`"${ addHeader.join('","') }"\n`)
                headerIndex = addHeader
            }

            csv.read({
                mapHeader(header, index) {
                    headerIndex[index] = header
                    rowLength = Math.max(rowLength, index + 1)
                    return header
                },
                onRow(row) {
                    const output = new Array(rowLength).fill('')
                    for (let i = 0 ; i < output.length ; i++) {
                        const value = row[headerIndex[i]]
                        if (typeof value === 'string')
                            output[i] = `"${ value.replace(/"/g, '""') }"`
                    }
                    writeStream.write(output.join(','))
                    writeStream.write('\n')
                },
                onEnd() {
                    writeStream.close((error) => {
                        if (error)
                            reject(error)
                        else
                            resolve(destination)
                    })
                    
                }
            })
        })
        
    }

    async insertIntoTable<T extends AnyClass>(
        table: Table<T>,
        batchSize: number = 100
    ): Promise<number> {
        const csv = this
    
        return new Promise((resolve, reject) => {
            // Track current batch, total ingested rows
            let batch: AnyObject[] = []
            let rows = 0
            let ingested = 0

            // Track all insert promises to increment ingestion size
            const inserts: Array<Promise<any>> = []
            function ingestBatch(ingest: AnyObject[]) {
                rows += ingest.length
                inserts.push(table.insertValid(ingest, batchSize).then(() => {
                    ingested += ingest.length
                }))
            }

            csv.read({
                // Generate mapper functions for this table's schema
                ...csv.getTableMappers(table),

                /**
                 * Push each row into the batch array, and ingest the batch when it has reached
                 * the maximum size for each batch (default 1000)
                 * 
                 * @param row 
                 */
                onRow(row) {
                    batch.push(row)
                    if (batch.length >= batchSize) {
                        ingestBatch(batch)
                        batch = []
                    }
                },
                /**
                 * When the entire file has been read, ingest the final batch and wait for all
                 * inserts to complete before resolving the surrounding Promise
                 */
                onEnd() {
                    if (batch.length > 0)
                        ingestBatch(batch)
                    
                    Promise.all(inserts).then(() => {
                        if (ingested != rows) {
                            console.log('Some rows not ingested', ingested, rows)
                        }
                        resolve(rows)
                    })
                },

                /**
                 * Pass any read errors to the outer Promise rejection
                 * @param error 
                 */
                onError(error) {
                    reject(error)
                }
            })
        })
    }

    private getTableMappers(table: Table): { mapHeader: CSVHeaderMapper, mapValue: CSVValueMapper } {
        const csv = this
        return {
            /**
             * 
             * @param header 
             * @returns 
             */
            mapHeader(header) {
                if (table.hasColumnCSV(header))
                    return table.getColumnByCSV(header).getName()
                else
                    return header
            },
            /**
             * 
             * @param header 
             * @param value 
             * @returns 
             */
            mapValue(header, value) {
                const column = table.getColumnByName(header)
                if (column) {
                    try {
                        return column.transformFromString(value)
                    }
                    catch (error) {
                        if (column.def.defaultValue)
                            return column.def.defaultValue

                        console.log(error, `${ header } = (${ value })`)
                        csv.addError(column, error)
                        return value
                    }
                }
                return value
            }
        }
    }

    logErrors(errorLog?: CSVErrorLog): this {
        this.errorLog = errorLog || {}
        return this
    }

    getErrorLog(): CSVErrorLog {
        return this.errorLog
    }

    private addError(column: Column, error: Error) {
        if (! this.errorLog || typeof error !== 'object')
            return

        const code: string = error['code'] || 'system'
        if (! this.errorLog[column.name])
            this.errorLog[column.name] = {}

        const columnError = this.errorLog[column.name]
        if (! columnError[code])
            columnError[code] = []
        columnError[code].push(error)
    }

    private displayErrors() {

    }
}