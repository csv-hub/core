import fs from 'fs'
import path from 'path'
import { IncomingMessage } from 'http'
import https from 'https'
import { execSync as exec } from 'child_process'

import { DownloadError } from './error'
import { DownloadSource, DownloadDefinition, DownloadOption } from './types'

export async function download(dir: string, source: DownloadSource, ...args: any[]) {
    const def: DownloadDefinition = (typeof source === 'function') ? source.apply(null, args) : source
    return downloadUrl(def.url, dir, def)
}

/**
 * Downloads the contents at the given URL
 * 
 * @param url 
 * @param dest 
 * @param param2 
 * @returns 
 */
export async function downloadUrl(url: string, dest: string, { unzip, redirectLimit = 3 }: DownloadOption = {}) {
	
    return new Promise((resolve: (dest: string) => any, reject) => {

        /**
         * Recursively called with the URL returned from 301/302 redirects
         */
        function makeRequest(url: string, handler: (response: IncomingMessage) => any, redirect: number = 0) {
            return https.get(url, (response) => {
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
		const file = fs.createWriteStream(dest)
		const request = makeRequest(url, (response) => {
			response.pipe(file)

			file.on('finish', () => {
				file.close((error) => {
					if (error)
						reject(error)
					else {
                        if (unzip) {
                            const base = path.basename(dest, '.zip')
                            // TODO: check for .tar.gz and other compression formats

                            // TODO: download with progress
                            // + Optional unzipping of result
                            // exec('unzip ' + date + '.zip -d ' + date, { cwd: dest })
                            // exec('rm ' + date + '.zip', { cwd: dest })
                            // + Redownload flag to overwrite existing destination
                        }
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