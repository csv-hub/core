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