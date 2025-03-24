import { S3Client } from '@aws-sdk/client-s3'

import type { TransportExecutor } from '../../types'

export default {
    async canTransport() {
        return false
    },
    async transportSource() {

    },
    async afterTransportingSource() {
        
    }
} satisfies TransportExecutor<'s3'>