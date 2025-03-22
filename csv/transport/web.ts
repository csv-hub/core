import fs from 'fs'
import path from 'path'
import { IncomingMessage } from 'http'
import https from 'https'
import http from 'http'
import { execSync as exec } from 'child_process'

import { WebSource, TransportProgress } from '../types'

export async function canTransportWeb(): Promise<boolean> {
    // TODO: check internet
    return true
}

/**
 * Downloads the contents at the given URL
 * 
 * @param url 
 * @param dest 
 * @param param2 
 * @returns 
 */
export async function transportWebSource({ url, name, secure, unzip, redirectLimit = 3 }: WebSource, dir: string, progress?: TransportProgress) {

    return new Promise((resolve: (writtenTo: string) => any, reject) => {

        /**
         * Recursively called with the URL returned from 301/302 redirects
         */
        function makeRequest(url: string, handler: (response: IncomingMessage) => any, redirect: number = 0) {
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
                progress(0, contentLength)
                let contentDownloaded = 0
                // console.log(`Downloading ${ displayBytes(contentLength) }`)
                
                response.on('data', (chunk) => {
                    contentDownloaded += chunk.length
                    progress(contentDownloaded, contentLength)
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
}

export async function afterTransportingWebSource({ name, url, unzip }: WebSource, dir: string) {
    const dest = path.join(dir, name || path.basename(url))

    if (unzip) {
        const base = path.basename(dest, '.zip')
        // TODO: check for .tar.gz and other compression formats
        exec(`unzip ${ base }.zip -d ${ base }`, { cwd: path.dirname(dest) })
        exec(`rm ${ base }.zip`, { cwd: dest })
    }
}

export class DownloadError extends Error {
    url: string
    response: IncomingMessage

    constructor(url: string, response: IncomingMessage) {
        super(`URL ${ url } return ${ response.statusCode } error`)
        this.url = url
        this.response = response
    }
}

function displayBytes(bytes: number): string {
    let kb = (bytes / 1000)
    let unit = 'KB'
    if (kb >= 1000000000) {
        unit = 'TB'
        kb = kb / 1000000000
    }
    else if (kb >= 1000000) {
        unit = 'GB'
        kb = kb / 1000000
    }
    else if (kb >= 1000) {
        unit = 'MB'
        kb = kb / 1000
    }
    
    return [ kb.toFixed(1).replace(/\.0$/g, ''), unit ].join(' ')
}