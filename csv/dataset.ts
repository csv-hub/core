import fs from 'fs'
import path from 'path'
import { execSync as exec } from 'child_process'

import type { AnyObject } from '../data'

/**
 * Represents a directory with a 
 */
export class CSVDataset {
    name: string
    dir?: string

    constructor(name: string, dir?: string) {
        this.name = name
        this.dir = dir
    }

    initialize() {
        if (! this.dir) return
        
        fs.mkdirSync(this.dir, { recursive: true })
        const packageFile = path.join(this.dir, 'package.json')
        const tsconfigFile = path.join(this.dir, 'tsconfig.json')

        if (! fs.existsSync(packageFile))
            fs.writeFileSync(packageFile, JSON.stringify({
                
            }, null, 4), 'utf8')
    }

    clone() {
        exec(`git clone https://github.com/csv-hub/data-${ this.name } ${ this.name }`)
    }

}

function writePackageJSON(dirname: string, config: AnyObject) {
    const packageFile = path.join(dirname, 'package.json')
    const currentPackage: AnyObject = fs.existsSync(packageFile) ? JSON.parse(fs.readFileSync(packageFile, 'utf8')) : {} 
    Object.assign(currentPackage, config)
    fs.writeFileSync(packageFile, JSON.stringify(currentPackage, null, 4), 'utf8')
}