import path from 'path'
import { spawn, execSync as exec } from 'child_process'

import type { DoltSource } from '../types'

export async function canTransportDolt() {
    try {
        exec('which dolt')
        return true
    }
    catch (error) {
        return false
    }
}

/**
 * Clone a Dolt repository to a local directory using the given source specification.
 * @param source 
 * @param dir 
 */
export async function transportDoltSource(source: DoltSource, dir: string) {
    const branch = source.branch || 'master'
    const name = sourceName(source)

    await doltCommand(['clone', '--depth=1', '--branch=' + branch, source.repository, name], dir)
}

/**
 * Execute dolt dump within the repository directory
 * @param source 
 * @param dir 
 */
export async function afterTransportingDoltSource(source: DoltSource, dir: string) {
    const doltDir = path.join(dir, sourceName(source))
    console.log(doltDir)
    await doltCommand(['dump', '-f', '--result-format=csv', '--directory=' + doltDir], doltDir)
}

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

function sourceName(source: DoltSource) {
    return source.name || path.basename(source.repository)
}