import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const SANDBOX = path.join(__dirname, '../../../sandbox')

function downloadDolt(identifier: string, branch = 'master', dir: string) {
    const dolt = spawn('dolt', ['clone', '--depth=1', '--branch=' + branch, identifier, dir], {
        cwd: SANDBOX,
        stdio: 'pipe'
    })
    dolt.stdout.on('data', (data) => {
        console.log(data.toString())
    })
    dolt.stderr.on('data', (data) => {
        // console.log('dolt error', data.toString())
    })
    dolt.on('close', () => {
        console.log('Dolt cloned')
        const doltDir = path.join(SANDBOX, dir)
        const dump = spawn('dolt', ['dump', '-f', '--result-format=csv', '--directory=' + doltDir], {
            cwd: doltDir
        })
        dump.on('close', () => {
            console.log('Dolt dump finished')
        })
    })

    
}

downloadDolt('dolthub/hospital-price-transparency', 'master', 'cms')

export class DoltDataSource {
 
    async downloadDataset(identifier: string) {
        // exec(`dolt clone ${ identifier }`)
        spawn('dolt', ['clone', ''], {
            
        })
        // Load .sql files into ClickHouse
        // https://clickhouse.com/docs/integrations/data-formats/sql
    }

    async isAvailable() {
        // TODO: check if dolt is on command line
        return true
    }

}