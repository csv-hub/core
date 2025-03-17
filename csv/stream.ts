import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

import type { Table } from '../../server'
import type { AnyClass, AnyObject } from '../../server/types'

export async function streamInsertCSV<T extends AnyClass>(
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
        let batch: AnyObject[] = []

        fs.createReadStream(csvFile)
            .pipe(csv({
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
                            return column.fromString(value)
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
                    inserts.push(table.insertAny(batch, batchSize))
                    batch = []
                }
            })
            .on('end', () => {
                if (batch.length > 0)
                    inserts.push(table.insertAny(batch, batchSize))
                
                Promise.all(inserts).then(() => {
                    resolve(rows)
                })
            })
            .on('error', (error) => {
                reject(error)
            })
    })
}