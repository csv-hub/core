import fs from 'fs'
import path from 'path'

/**
 * A specific CSVHub directory is a git repository where each dataset is loaded as a submodule.
 */
export class CSVHub {
    dir: string

    constructor(dir: string) {
        this.dir = dir
        this.load()
    }

    /**
     * Read all directories that have been loaded, and 
     */
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