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
    canTransportWeb,
    transportWebSource
} from './web'

const transportDependencyHandler: Record<TransportType, () => Promise<boolean>> = {
    dolt: async () => {
        try {
            exec('which dolt')
            return true
        }
        catch (error) {
            return false
        }
    },
    web: async () => {
        // check Internet connection
        return true
    },
    s3: async () => {
        // check AWS credentials and permissions available
        return true
    }
}

// Map imported handlers to objects to store as building components of a final asynchronous transport function
const transportSourceHandler: { [T in TransportType]: (source: TransportSource<T>, dest: string) => Promise<any> } = {
    web: transportWebSource,
    dolt: async (source) => {
        // TODO
    },
    s3: async (source) => {
        // TODO
    }
}

/**
 * Exports a single pure function for generating a Transport type object, which can be used to
 * extract data from multiple locations through the `transportFile` and `transportDirectory` methods.
 * 
 * @param type 
 * @returns 
 */
export function getTransport<T extends TransportType>({ type, source, destination }: TransportDefinition<T>) {
    // A working temporary directory for the transport
    const tmpdirName = path.join(os.tmpdir(), `csv-${ type }-`)
    const sources = Array.isArray(source) ? source : [ source ]
    const transportSource = transportSourceHandler[type]

    // - check that the transport type is available for dolt
    // if (transportDependency[type] && ! await transportDependency[type]())

    /**
     * Returns 
     */
    return async function(dest: string) {
        // Create a temporary directory with any results of the transport contained within it
        const tmpdir = fs.mkdtempSync(tmpdirName)

        for (const source of sources) {
            console.log('Getting source')
            await transportSource(source, tmpdir)
        }

        for (const transport of destination) {
            console.log('Writing destination')
            const sourceFile = path.join(tmpdir, transport.source)
            if (! fs.existsSync(sourceFile)) {
                console.log('Cannot find ' + sourceFile)
            }
            else {
                const destFile = path.join(dest, transport.file || transport.source)
                const destDir = path.dirname(destFile)
                fs.mkdirSync(destDir, { recursive: true })
                fs.renameSync(sourceFile, destFile)
            }       
        }

        // Clean the temporary directory after transporting
        fs.rmdirSync(tmpdir)
    }

}