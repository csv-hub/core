import type stream from 'stream'

export type CSVRow = { [key: string]: any }
export type CSVRowReader = (row: { [key: string]: any }, stream: stream.Transform) => any

export type CSVHeaderMapper = (header: string, index: number) => string
export type CSVValueMapper = (header: string, value: string, index: number) => any

export type CSVErrorLog = { [column: string]: {
    [code: string]: Error[]
} }