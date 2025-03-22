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

    async clone() {
        return new Promise((resolve, reject) => {

        })
    }

}