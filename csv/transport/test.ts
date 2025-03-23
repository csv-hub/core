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

    const getDolt = getTransport({
        type: 'dolt',
        source: {
            repository: 'post-no-preference/rates',
            name: 'table'
        },
        destination: {
            source: 'table/us_treasury.csv',
            file: 'us_treasury.csv'
        },
        clean: false
    })

    // await getWeb(SANDBOX)
    await getDolt(SANDBOX)
}

main()