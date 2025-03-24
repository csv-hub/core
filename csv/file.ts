import fs from 'fs'
import path from 'path'
import stream from 'stream'
import csv from 'csv-parser'

import type { Table, Column, AnyClass, AnyObject } from '../server'
import { CSVRow, CSVRowReader, CSVHeaderMapper, CSVValueMapper } from './types'

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
    error?: { [column: string]: {
        [code: string]: Error[]
    } }

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
            mapHeaders: callback.mapHeader ? ({ header, index }) => callback.mapHeader(header, index) : undefined,
            mapValues: callback.mapValue ? ({ header, value, index }) => callback.mapValue(header, value, index) : undefined
        }))
        .on('data', (data) => callback.onRow(data, stream))
        .on('end', () => callback.onEnd(stream))
        .on('error', (error) => callback.onError(error, stream))

        return stream
    }

    async insertIntoTable<T extends AnyClass>(
        table: Table<T>, 
        csvFile: string,
        batchSize: number = 1000
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
                inserts.push(table.insertAny(ingest, batchSize).then(() => {
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
                        csv.addError(column, error)
                        return value
                    }
                }
                return value
            }
        }
    }

    logErrors(): this {
        this.error = {}
        return this
    }

    private addError(column: Column, error: Error) {
        if (! this.error || typeof error !== 'object' || ! error.hasOwnProperty('code'))
            return

        if (! this.error[column.name])
            this.error[column.name] = {}
        if (! this.error[column.name][error['code']])
            this.error[column.name][error['code']] = []
        this.error[column.name][error['code']].push(error)
    }
}