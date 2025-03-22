import fs from 'fs'
import path from 'path'

export class CSVHub {
    dir: string

    constructor(dir: string) {
        this.dir = dir
    }

    load() {
        for (const datasetName of fs.readdirSync(this.dir)) {
            const datasetDir = path.join(this.dir, datasetName)
            if (! fs.statSync(datasetDir).isDirectory())
                continue

            this.loadDataset(datasetDir)
        }
    }

    loadDataset(datasetDir: string) {
        // TODO: check for package.json
    }

    listDatasets() {
        // return dataset objects
    }

    addDataset(name: string) {
        // TODO: git clone github.com/csv-hub/dataset-[name]
    }

    getDataset(name: string) {

    }
}