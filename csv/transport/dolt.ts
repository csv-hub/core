import path from 'path'
import { spawn, execSync as exec } from 'child_process'

import type { DoltSource, TransportExecutor } from '../../types'

/**
 * Transport implementation for dolt
 */
export default {
    async canTransport() {
        try {
            exec('which dolt')
            return true
        }
        catch (error) {
            return false
        }
    },
    // Run dolt clone to transport the source
    async transportSource(source, dir) {
        const branch = source.branch || 'master'
        const name = source.name || path.basename(source.repository)

        await doltCommand(['clone', '--depth=1', '--branch=' + branch, source.repository, name], dir)
    },
    // Run dolt dump to generate CSV files
    async afterTransportingSource(source, dir) {
        const doltDir = path.join(dir, source.name || path.basename(source.repository))
        await doltCommand(['dump', '-f', '--result-format=csv', '--directory=' + doltDir], doltDir)
    }
} satisfies TransportExecutor<'dolt'>

/**
 * Spawn a process to execute a dolt command.
 * 
 * @param command 
 * @param cwd 
 * @returns 
 */
async function doltCommand(command: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const dolt = spawn('dolt', command, {
            cwd,
            stdio: 'pipe'
        })
        const stdout: string[] = []
        const stderr: string[] = []

        dolt.stdout.on('data', (data) => {
            // console.log(data.toString())
            stdout.push(data.toString())
        })
        dolt.stderr.on('data', (data) => {
            // console.log(data.toString())
            // stderr.push(data.toString())
        })
        dolt.on('close', () => {
            if (stderr.length > 0)
                reject(stderr.join(''))
            else
                resolve(stdout.join(''))
        })
    })   
}