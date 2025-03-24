import os from 'os'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import ProgressBar from 'progress'

import type { 
    TransportType, TransportDefinition, 
    TransportSource, TransportDestination,
    TransportProgress,
    TransportExecutorMap
} from '../../types'

import dolt from './dolt'
import web from './web'
import s3 from './s3'

const transportExecutor: TransportExecutorMap = { web, dolt, s3 }


/**
 * Exports a single pure function for generating a Transport type object, which can be used to
 * extract data from multiple locations through the `transportFile` and `transportDirectory` methods.
 * 
 * @param type 
 * @returns 
 */
export function getTransport<T extends TransportType>({ type, source, destination, clean }: TransportDefinition<T>) {
    // A working temporary directory for the transport
    const tmpdirName = path.join(os.tmpdir(), `csv-${ type }-`)
    const sources = Array.isArray(source) ? source : [ source ]
    const destinations = Array.isArray(destination) ? destination : [ destination ]

    const executor = transportExecutor[type]

    // - check that the transport type is available for dolt
    // if (transportDependency[type] && ! await transportDependency[type]())

    /**
     * Returns 
     */
    return async function(dest: string, verbose?: boolean) {
        // Create a temporary directory with any results of the transport contained within it
        const tmpdir = fs.mkdtempSync(tmpdirName)
        if (verbose) {
            console.log(chalk.bold.green(`Starting transport with "${ type }" strategy`))
            console.log(' > ' + chalk.green('created temporary directory'))
            console.log('   ' + chalk.gray(tmpdir))
        }

        // Transport each source specification
        for (const source of sources) {
            if (! await executor.canTransport(source)) {
                if (verbose) {
                    console.log(' > ' + displaySource(source))
                    console.log(chalk.red('   * Cannot transport source - ensure all identifiers are valid'))
                }
                continue
            }

            if (verbose) {
                console.log(' > ' + chalk.green('Transporting source'))
                console.log('   ' + displaySource(source))
            }

            let progressBar: ProgressBar;
            const progress: TransportProgress | undefined = verbose ? (completed: number, total: number, added: number) => {
                if (! progressBar) {
                    progressBar = new ProgressBar('   [:bar] :rate/bps :percent :etas', { 
                        total,
                        complete: '=',
                        width: 30,
                        incomplete: ' '
                    })
                }
                else {
                    progressBar.tick(added)
                }
            } : undefined

            try {
                await executor.transportSource(source, tmpdir, progress)
                await executor.afterTransportingSource(source, tmpdir)
            }
            catch (error) {
                console.log('error', error)
            }
        }

        // console.log(displayDirectory(tmpdir))

        // Write each destination specification from the source
        for (const destination of destinations) {
            if (verbose) {
                console.log(' > ' + chalk.green('Moving to destination'))
                console.log('   ' + chalk.bold(destination.source) + ' > ' + chalk.bold(destination.file))
            }

            const sourceFile = path.join(tmpdir, destination.source)
            if (! fs.existsSync(sourceFile)) {
                if (verbose)
                    console.log('Cannot find ' + sourceFile)
            }
            else {
                const destFile = path.join(dest, destination.file || destination.source)
                const destDir = path.dirname(destFile)
                fs.mkdirSync(destDir, { recursive: true })
                fs.renameSync(sourceFile, destFile)
            }       
        }

        // Clean the temporary directory after transporting
        if (clean !== false) {
            console.log(chalk.gray(' > Cleaning temporary directory'))
            fs.rmSync(tmpdir, { recursive: true, force: true })
        }
        console.log(chalk.green(' > Completed transport'))
    }

}

function displaySource({ url, name }: { [key: string]: any }): string {
    if (url) {
        if (url.length > 40)
            url = url.substring(0, 37) + '...'
        return chalk.underline(url) + (name ? (chalk.gray(' --> ') + chalk.bold(name)) : '')
    }
    return ''
}