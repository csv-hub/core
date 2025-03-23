import os from 'os'
import fs from 'fs'
import path from 'path'
import { execSync as exec } from 'child_process'

import type { 
    TransportType, TransportDefinition, 
    TransportSource, TransportDestination,
    WebSource
} from '../types'

import {
    afterTransportingDoltSource,
    canTransportDolt,
    transportDoltSource
} from './dolt'

import {
    afterTransportingWebSource,
    canTransportWeb,
    transportWebSource
} from './web'

import {
    canTransportS3,
    transportS3Source
} from './s3'

import { displayDirectory } from '../util/display'

// MAPPINGS OF CALLBACK FUNCTIONS
// The following maps type check and organize the imports from each transport implementation.

const transportValidator: { [T in TransportType]: (source: TransportSource<T>) => Promise<any> } = {
    dolt: canTransportDolt,
    web: canTransportWeb,
    s3: canTransportS3
}

// Map imported handlers to objects to store as building components of a final asynchronous transport function
const transportSource: { [T in TransportType]: (source: TransportSource<T>, dest: string) => Promise<any> } = {
    web: transportWebSource,
    dolt: transportDoltSource,
    s3: transportS3Source
}

const afterTransportSource: { [T in TransportType]: (source: TransportSource<T>, dest: string) => Promise<any> } = {
    web: afterTransportingWebSource,
    dolt: afterTransportingDoltSource,
    s3: async () => false
}

/**
 * Exports a single pure function for generating a Transport type object, which can be used to
 * extract data from multiple locations through the `transportFile` and `transportDirectory` methods.
 * 
 * @param type 
 * @returns 
 */
export function getTransport<T extends TransportType>({ type, source, destination, clean, verbose }: TransportDefinition<T>) {
    // A working temporary directory for the transport
    const tmpdirName = path.join(os.tmpdir(), `csv-${ type }-`)
    const sources = Array.isArray(source) ? source : [ source ]
    const destinations = Array.isArray(destination) ? destination : [ destination ]

    const canTransport = transportValidator[type]
    const transporter = transportSource[type]
    const afterTransporting = afterTransportSource[type]

    // - check that the transport type is available for dolt
    // if (transportDependency[type] && ! await transportDependency[type]())

    /**
     * Returns 
     */
    return async function(dest: string) {
        // Create a temporary directory with any results of the transport contained within it
        const tmpdir = fs.mkdtempSync(tmpdirName)
        if (verbose)
            console.log('Created ' + tmpdir)

        // Transport each source specification
        for (const source of sources) {
            if (! await canTransport(source)) {
                if (verbose) 
                    console.log('Cannot transport source')
                continue
            }

            if (verbose)
                console.log('Getting source')
            try {
                await transporter(source, tmpdir)
                await afterTransporting(source, tmpdir)
            }
            catch (error) {
                console.log('error', error)
            }
        }

        // console.log(displayDirectory(tmpdir))

        // Write each destination specification from the source
        for (const destination of destinations) {
            if (verbose)
                console.log('Writing destination')

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
        if (clean === false) {
            console.log('dir: ' + tmpdir)
        }
        else fs.rmSync(tmpdir, { recursive: true, force: true })
    }

}