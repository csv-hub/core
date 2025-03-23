import os from 'os'
import fs from 'fs'
import path from 'path'

export function createTemporaryDirectory(prefix?: string): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), `${ prefix }-`))
}

export function directoryHasFile(dir: string, file: string): boolean {
    return fs.existsSync(path.join(dir, file))
}

export function removeDirectory(dir: string) {
    fs.rmSync(dir, { recursive: true, force: true })
}