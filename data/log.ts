import chalk from 'chalk'

import type { Database, Table, Column } from '.'
import type { TransportDefinition } from '../types'
import type { CSVErrorLog } from '../csv/types'

export function tableTransportStart(table: Table, verbose = true) {
    if (! verbose) return
    console.log(chalk.bold.green(`Starting transport for table "${ table.getName() }"`))
    console.log(' > ' + chalk.gray('Creating or replacing table'))
}

export function tableTransport(table: Table, transport: TransportDefinition, verbose = true) {
    if (! verbose) return
    console.log(' > ' + chalk.green(transport.description || `Running transport strategy "${ transport.type }"`))
}

export function tableTransportFinish(table: Table, verbose: boolean) {
    // throw new Error('Function not implemented.')
}

export function tableTransportErrors(errorLog: CSVErrorLog) {
    const columns = Object.keys(errorLog)
    if (columns.length == 0) {
        console.log(chalk.green('No data validation errors!'))
    }
    else {
        console.log(chalk.red('Data validation errors'))
        for (const column of columns) {
            console.log(` > ${ column }`)
            for (const code of Object.keys(errorLog[column])) {
                const errors = errorLog[column][code]
                console.log(`    - ${ code } - ${ errors.length } errors`)   
                console.log(errors)
            }
        }
    }
}
