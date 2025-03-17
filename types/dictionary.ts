
interface S3Location {
    bucket: string
    region: string
    key: string

    // Currently only named CSV supported
    format: 'CSVWithNames'
}

export interface DictionaryDefinition {
    primaryKey: string | string[]

    source?: S3Location

    lifetime?: { min?: number, max?: number }
    layout: DictionaryLayout
}

export type DictionaryLayout = 'hashed' | 'flat' | 
    'sparse_hashed' | 'hashed_array' | 'range_hashed' |
    'complex_key_hashed' | 'complex_key_sparse_hashed' | 
    'complex_key_hashed_array'