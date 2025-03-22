import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

import { CSVLocation } from './types'
import type { Table, AnyClass, AnyObject } from '../server'

export class CSVFile {
    filename: string
    
    // Characters for delimiting values
    separator = ','
    escape = '"'
    newline = '\n'

    headers?: boolean | string[]

    constructor(filename: string) {
        this.filename = filename
    }

    async download(dirname: string, location: CSVLocation) {
        
    }

    async downloadWeb() {

    }

    async downloadDolt(dirname: string) {

    }

    async insertIntoTable<T extends AnyClass>(
        table: Table<T>, 
        csvFile: string,
        batchSize: number = 1000
    ): Promise<number> {
        const errors: { [column: string]: {
            [code: string]: Error[]
        } } = {}
    
        const inserts: Array<Promise<any>> = []
    
        return new Promise((resolve, reject) => {
            let rows = 0
            let ingested = 0
    
            let batch: AnyObject[] = []
            function ingestBatch(ingest: AnyObject[]) {
                rows += ingest.length
                inserts.push(table.insertAny(ingest, batchSize).then(() => {
                    ingested += ingest.length
                }))
            }
    
            const stream = fs.createReadStream(csvFile)
                .pipe(csv({
                    separator: this.separator,
                    headers: this.headers,
                    escape: this.escape,
                    newline: this.newline,
                    mapHeaders: ({ header }) => {
                        if (table.hasColumnCSV(header))
                            return table.getColumnByCSV(header).getName()
                        else
                            return header
                    },
    
                    mapValues: ({ header, value }) => {
                        const column = table.getColumnByName(header)
                        if (column) {
                            try {
                                return column.transformFromString(value)
                            }
                            catch (error) {
                                if (typeof error === 'object' && error.code) {
                                    if (! errors[column.name])
                                        errors[column.name] = {}
                                    if (! errors[column.name][error.code])
                                        errors[column.name][error.code] = []
                                    errors[column.name][error.code].push(error)
                                }
                                else console.error('untracked error', error)
                                return value
                            }
                        }
                        else {
                            console.log('Unknown column', header)
                        }
                        return value
                    }
                }))
                .on('data', (data) => {
                    batch.push(data)
                    if (batch.length >= batchSize) {
                        ingestBatch(batch)
                        batch = []
                    }
                })
                .on('end', () => {
                    if (batch.length > 0)
                        ingestBatch(batch)
                    
                    Promise.all(inserts).then(() => {
                        resolve(rows)
                    })
                })
                .on('error', (error) => {
                    reject(error)
                })
        })
    }
}