import fs from 'fs'
import path from 'path'

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

import type { TransportExecutor } from '../../../types'

export default {
    async canTransport() {
        return false
    },
    async transportSource({ region, bucket, prefix, key, name, requesterPays }, dir: string) {
        const client = new S3Client({ region })
        const result = await client.send(new GetObjectCommand({
            Bucket: bucket,
            Key: prefix ? path.join(prefix, key) : key,
            RequestPayer: requesterPays ? 'requester' : undefined
        }))
        const content = await result.Body.transformToByteArray()
        fs.writeFileSync(path.join(dir, name || key), content)
    },
    async afterTransportingSource() {
        // TODO: decompress if tar.gz
    }
} satisfies TransportExecutor<'s3'>