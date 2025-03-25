import http from 'http'
import chalk from 'chalk'

import { TransportProgress } from '../../types'
import { displayBytes } from './display'

/**
 * Binds an HTTP download to a progress function
 */
export function bindProgress(response: http.IncomingMessage, progress?: TransportProgress): number {
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

    return contentLength
}