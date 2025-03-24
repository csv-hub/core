import fs from 'fs'
import path from 'path'

import type { TransportExecutor } from '../../../types'

export default {
    async canTransport() {
        return false
    },
    async transportSource({ }, dir: string) {
        // TODO: make a simple web request to git raw
    },
    async afterTransportingSource() {
        // TODO: decompress if tar.gz
    }
} satisfies TransportExecutor<'github'>

function getGithubFile(repository: string, branch: string, file: string) {
    const url = `https://github.com/${ repository }/raw/refs/heads/${ branch }/${ file }`
}