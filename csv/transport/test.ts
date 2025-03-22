import fs from 'fs'
import path from 'path'

import { getTransport } from './transport'

const SANDBOX = path.join(__dirname, '../../../sandbox')

async function main() {
    const getWeb = getTransport({ 
        type: 'web', 
        source: [
            {
                url: 'https://calmcode.io/static/data/bigmac.csv'
            }
        ], 
        destination: [
            {
                source: 'bigmac.csv',
                file: 'bigmac.csv'
            }
        ]
    })

    await getWeb(SANDBOX)
    
}

main()