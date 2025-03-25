import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import chalk from 'chalk'

import { spawn, execSync as exec } from 'child_process'
import { DownloadError } from '../error'

import type { TransportExecutor, TransportProgress, GithubSource } from '../../../types'
import { bindProgress } from '../../util/progress'

export default {
    async canTransport({ repository, branch, file }) {
        // TODO: ensure repository exists
        if (file) {
            // ensure file exists
        }
        return true
    },
    
    /**
     * Transport the source
     */
    async transportSource({ repository, branch, file, name }, dir: string, progress) {
        if (file) {
            const url = `https://github.com/${ repository }/raw/refs/heads/${ branch || 'master' }/${ file }`
            const dest = path.join(dir, name || path.join(path.basename(repository), file))
            const writeStream = fs.createWriteStream(dest)
            console.log(url)

            return new Promise((resolve, reject) => {

                /**
                 * Recursively called with the URL returned from 301/302 redirects
                 */
                function makeRequest(url: string, handler: (response: http.IncomingMessage) => any) {
                    return https.get(url, (response) => {
                        // Follow 301/302 redirects
                        if ((response.statusCode === 301 || response.statusCode === 302) && response.headers.location) {
                            makeRequest(response.headers.location, handler)
                        }
                        else if (response.statusCode !== 200)
                            reject(new DownloadError(url, response))
                        // Otherwise pass the response to the provided handler
                        else handler(response)
                    })
                }


                const request = makeRequest(url, (response) => {

                    // Write the stream with progress reporting
                    bindProgress(response, progress)
                    response.pipe(writeStream)
                    
                    // When the stream is finished, resolve the promise
                    writeStream.on('finish', () => {
                        request.destroy()
                        writeStream.close((error) => {
                            if (error)
                                reject(error)
                            else {
                                resolve(dest)
                            }
                        })
                    })
                })
            })
        }
        else {
            await gitCommand(['clone', `https://github.com/${ repository }`, name || path.basename(repository)], dir)
        }
    },
    async afterTransportingSource() {
        // TODO: decompress if tar.gz
    }
} satisfies TransportExecutor<'github'>

// TODO: refactor
async function transportGithubFile({ repository, file, branch, name }: GithubSource, dir: string, progress: TransportProgress) {
    const url = `https://github.com/${ repository }/raw/refs/heads/${ branch || 'master' }/${ file }`
    const dest = path.join(dir, name || path.join(path.basename(repository), file))
    const writeStream = fs.createWriteStream(dest)

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            // Write the stream with progress reporting
            bindProgress(response, progress)
            response.pipe(writeStream)
            
            // When the stream is finished, resolve the promise
            writeStream.on('finish', () => {
                writeStream.close((error) => {
                    if (error)
                        reject(error)
                    else {
                        resolve(dest)
                    }
                })
            })
        })
    })
}

/**
 * Spawn a process to execute a dolt command.
 * 
 * @param command 
 * @param cwd 
 * @returns 
 */
async function gitCommand(command: string[], cwd: string): Promise<string> {
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