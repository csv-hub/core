import fs from 'fs'
import path from 'path'

import { createTransport } from './transport'

const SANDBOX = path.join(__dirname, '../../../sandbox')

async function main() {
    const getWeb = createTransport({ 
        type: 'web', 
        source: [
            {
                "name": "0.csv",
                "url": "https://data.sba.gov/dataset/8aa276e2-6cab-4f86-aca4-a7dde42adf24/resource/c1275a03-c25c-488a-bd95-403c4b2fa036/download/public_150k_plus_240930.csv"
            }
        ], 
        destination: [
            {
                source: '0.csv',
                file: '0.csv'
            }
        ]
    })

    const getGithub = createTransport({
        type: 'github',
        source: [
            {
                repository: 'laxmimerit/All-CSV-ML-Data-Files-Download',
                branch: 'master',
                file: 'IMDB-Dataset.csv',
                name: 'imdb.csv'
            }
        ],
        destination: [
            {
                source: 'imdb.csv'
                // file: 'imdb.csv'
            }
        ]
    })

    await getWeb({ destination: SANDBOX, verbose: true })
    console.log('Done with transport')
}

main()