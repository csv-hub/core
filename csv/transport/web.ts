// File system
import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import { execSync as exec } from 'child_process'
import chalk from 'chalk'

// Networking
import https from 'https'
import http from 'http'
import dns from 'dns'

// Types and errors
import type { TransportExecutor } from '../../types'
import { DownloadError } from './error'

// Utility functions
import { displayBytes, displayDirectory } from '../util/display'

export default {
    async canTransport({ url }): Promise<boolean> {
        const parsed = new URL(url)
    
        return new Promise((resolve) => {
            dns.resolve(parsed.hostname, (error) => {
                resolve(! error)
            })
        })
    },
    async transportSource({ url, name, secure, redirectLimit = 3 }, dir: string, progress) {

        return new Promise((resolve: (writtenTo: string) => any, reject) => {
    
            /**
             * Recursively called with the URL returned from 301/302 redirects
             */
            function makeRequest(url: string, handler: (response: http.IncomingMessage) => any, redirect: number = 0) {
                const useHttps = secure || url.startsWith('https://')
    
                return (useHttps ? https : http).get(url, (response) => {
                    // Follow 301/302 redirects
                    if ((response.statusCode === 301 || response.statusCode === 302) && response.headers.location) {
                        if (redirect >= redirectLimit)
                            throw new Error('too many redirects') // TODO extract to error
                        makeRequest(response.headers.location, handler, redirect + 1)
                    }
                    else if (response.statusCode !== 200)
                        reject(new DownloadError(url, response))
                    // Otherwise pass the response to the provided handler
                    else handler(response)
                })
            }
    
            // Make the request and download the result to the output destination
            const dest = path.join(dir, name || path.basename(url))
            const file = fs.createWriteStream(dest)
            const request = makeRequest(url, (response) => {
                
                // Get the total byte size of the response, and communicate it to a progress handler if provided
                const contentLength = parseInt(response.headers['content-length'], 10)
                
                if (progress) {
                    console.log('   Downloading ' + chalk.bold(displayBytes(contentLength)))
                    progress(0, contentLength, 0)
                    let contentDownloaded = 0
                    response.on('data', (chunk) => {
                        contentDownloaded += chunk.length
                        progress(contentDownloaded, contentLength, chunk.length)
                    })
                }
                
                // Pipe the response to the write stream
                response.pipe(file)
    
                file.on('finish', () => {
                    file.close((error) => {
                        if (error)
                            reject(error)
                        else {
                            resolve(dest)
                        }
                    })
                })
            })
    
            
    
            file.on('error', (error) => {
                fs.unlink(dest, () => {
                    reject(error)
                })
            })
    
            request.on('error', (error) => {
                fs.unlink(dest, () => {
                    reject(error)
                })
            })
        })
    },
    async afterTransportingSource({ name, url, unzip }, dir: string) {
        const dest = path.join(dir, name || path.basename(url))
        const cwd = path.dirname(dest)
    
        if (unzip) {
            const base = path.basename(dest, '.zip')
            // TODO: check for .tar.gz and other compression formats
            exec(`unzip ${ base }.zip -d ${ base }`, { cwd })
            exec(`rm ${ base }.zip`, { cwd })
        }
    }
} satisfies TransportExecutor<'web'>
