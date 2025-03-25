import vm from 'vm'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

import type { Database } from '..'

const CORE_NODE_MODULES = path.join(__dirname, '../../../node_modules')

export function importDatasetInVM(database: Database, datasetDir: string) {
    // Ensure the latest version of the dataset is compiled
    execSync('tsc', { cwd: datasetDir })

    // Iterate over each compiled table and load the table with a VM execution
    const tableDir = path.join(datasetDir, 'dist/table')
    for (const fileName of fs.readdirSync(tableDir)) {
        if (! fileName.endsWith('.js')) continue

        const tableFile = path.join(tableDir, fileName)
        importTableInVM(database, tableFile, datasetDir)
    }
}

/**
 * Import a table through a VM execution
 * @param database 
 * @param filename 
 * @param node_modules 
 */
export function importTableInVM(database: Database, filename: string, datasetDir: string) {
    const dirname = path.dirname(filename)
    const table = database.tableDecorator()
    const column = database.columnDecorator()

    function vmRequire(name: string) {
        if (name.startsWith('.')) {
            const resolvedFile = require.resolve(path.join(dirname, name))
            // console.log('resolved', resolvedFile)
            return runScript(resolvedFile)
        }
        else return require(require.resolve(name, {
            paths: [
                path.join(datasetDir, 'node_modules'),
                CORE_NODE_MODULES
            ]
        }))
    }

    // Run the script file in the context
    function runScript(scriptFile: string) {
        const exportObject = {}
        vm.runInNewContext(fs.readFileSync(scriptFile, 'utf8'), {
            // Run required submodule scripts in new context
            require: vmRequire,
            // Reference same export object
            module: { exports: exportObject },
            exports: exportObject,
            // Decorators
            table, column
        })
        return exportObject
    }

    // Run the initial script
    return runScript(filename)
}