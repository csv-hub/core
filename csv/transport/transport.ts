import os from 'os'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import ProgressBar from 'progress'

import type { 
    TransportType, 
    TransportDefinition, 
    TransportProgress,
    TransportExecutorMap,
    TransportFunction,
    TransportOption
} from '../../types'

import { CSVFile } from '../file'
import { createTemporaryDirectory } from '../util/filesystem'

// All transport strategies
import dolt from './strategy/dolt'
import web from './strategy/web'
import s3 from './strategy/s3'
import github from './strategy/github'

// Collect all strategies into a single object map
const transportExecutor: TransportExecutorMap = { web, dolt, s3, github }

/**
 * Exports a function which executes the given transportation strategy definition and places the resulting CSV
 * files in the given output directory.
 * 
 * @param { TransportDefinition<T> } definition
 * @returns { TransportFunction<T> }
 */
export function createTransport<T extends TransportType>({ type, source, destination, clean }: TransportDefinition<T>): TransportFunction<T> {
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
    return async function({ 
        destination = createTemporaryDirectory(), 
        verbose = false,
        useCache = false
    }: TransportOption<T> = {}): Promise<string> {

        if (useCache && destinations.every((dest) => fs.existsSync(path.join(destination, dest.file || dest.source)))) {
            if (verbose)
                console.log(chalk.green('Using cached files'))
            return destination
        }

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
                    console.log(' > ' + displaySource(type, source))
                    console.log(chalk.red('   * Cannot transport source - ensure all identifiers are valid'))
                }
                continue
            }

            if (verbose) {
                console.log(' > ' + chalk.green('Transporting source'))
                console.log('   ' + displaySource(type, source))
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
        for (const dest of destinations) {
            if (verbose) {
                console.log(' > ' + chalk.green('Moving to destination'))
                console.log('   ' + chalk.bold(dest.source) + ' > ' + chalk.bold(dest.file || dest.source))
            }

            const sourceFile = path.join(tmpdir, dest.source)
            if (! fs.existsSync(sourceFile)) {
                if (verbose)
                    console.log('Cannot find ' + sourceFile)
                throw new Error('transport error: cannot find source file')
            }
            else {
                const destFile = path.join(destination, dest.file || dest.source)
                const destDir = path.dirname(destFile)
                fs.mkdirSync(destDir, { recursive: true })
                
                // Read the CSV file and remap separator properties
                if (dest.addHeader || dest.mapSeparator) {
                    await new CSVFile(sourceFile).transform(dest, destFile)
                }
                // Otherwise simply rename the file
                else fs.renameSync(sourceFile, destFile)
            }       
        }

        // Clean the temporary directory after transporting
        if (clean !== false) {
            if (verbose)
                console.log(chalk.gray(' > Cleaning temporary directory'))
            fs.rmSync(tmpdir, { recursive: true, force: true })
        }
        if (verbose) {
            console.log(chalk.green(' > Completed transport'))
            console.log('   ' + chalk.gray(destination))
        }

        return destination
    }

}

function displaySource(type: TransportType, { url, name, repository, file }: { [key: string]: any }): string {
    if (repository) {
        return (type == 'github' ? 'github/' : 'dolt/') + repository
    }
    if (url) {
        if (url.length > 40)
            url = url.substring(0, 37) + '...'
        return chalk.underline(url) + (name ? (chalk.gray(' --> ') + chalk.bold(name)) : '')
    }
    return ''
}