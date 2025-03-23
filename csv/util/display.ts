import fs from 'fs'
import path from 'path'

export function displayBytes(bytes: number): string {
    let kb = (bytes / 1000)
    let unit = 'KB'
    if (kb >= 1000000000) {
        unit = 'TB'
        kb = kb / 1000000000
    }
    else if (kb >= 1000000) {
        unit = 'GB'
        kb = kb / 1000000
    }
    else if (kb >= 1000) {
        unit = 'MB'
        kb = kb / 1000
    }
    
    return [ kb.toFixed(1).replace(/\.0$/g, ''), unit ].join(' ')
}


export function displayDirectory(dir: string, option: { indent: number, showHidden?: boolean } = { indent: 0 }): string {
    const spacing = option.indent > 0 ? (new Array(option.indent - 1).fill('|   ').join('') + '|-- ') : ''

    const display: string[] = [ spacing, path.basename(dir) ]
    if (fs.statSync(dir).isDirectory())
        for (const child of fs.readdirSync(dir)) {
            // Skip hidden directories
            if (child.startsWith('.') && option.showHidden !== true)
                continue
            // Recursively display the child directory
            display.push('\n', displayDirectory(path.join(dir, child), { 
                ...option, 
                indent: option.indent + 1 
            }))
        }
    return display.join('')
}