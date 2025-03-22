import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

import { GitRepositoryError } from '../error'

export async function gitCloneDataset(name: string, cwd: string) {
    return gitClone('https://github.com/csv-hub/dataset-' + name, name, cwd)
}

export async function gitClone(url: string, name: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['clone', url, name], { cwd })
        let error: any = null

        git.stdout.on('data', (data) => {
            console.log(data.toString())
        })

        git.stderr.on('data', (data) => {
            console.error(data.toString())
            // log error
        })

        git.on('close', () => {
            if (error)
                reject(error)
            else
                resolve(path.join(cwd, name))
        })
    })
}