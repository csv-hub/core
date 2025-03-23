
export interface TransportDefinition<T extends TransportType> {
    // Identifier of the transport
    type: T

    // Sources to ingest with the transportation mechanism 
    // (e.g. download from S3 bucket, clone a repo, wget a file)
    source: TransportSource<T> | Array<TransportSource<T>>

    // The destinations to write
    destination: TransportDestination | TransportDestination[]

    // Automatically runs this transport on a schedule (number is in hours)
    update_frequency?: 'day' | 'week' | 'month' | 'year' | number

    // If set to false, will output tmp directory instead of deleting
    clean?: boolean

    // If set to true, will print transport state to standard output
    verbose?: boolean
}

export interface TransportDestination {
    // File path of the source CSV file
    source: string

    // Optional file path to write the output
    file?: string

    // If the source CSV file does not have headers, adds the headers during the extraction process
    addHeader?: string[]
}

export type TransportType = 'web' | 's3' | 'dolt'

// For communicating progress on a transport operation
export type TransportProgress = (completed: number, total: number) => any

export type TransportSource<T extends TransportType> = TransportType extends T ? (S3Source & WebSource & DoltSource) :
        T extends 's3' ? S3Source : 
        T extends 'web' ? WebSource : 
        T extends 'dolt' ? DoltSource : never


export type TransportLocation<T extends TransportType> = { type: T } & TransportLocationInterface[T]

export interface S3Source {
    bucket: string
    key: string
}

export interface WebSource {
    url: string
    name?: string           // file name to give result (otherwise will be base of URL)

    secure?: boolean
    unzip?: boolean
    mkdir?: boolean         // default true
    redirectLimit?: number  // Limit 302 redirects
}

export interface DoltSource {
    branch?: string         // default master
    name?: string           // local folder name
    repository: string
}

interface TransportLocationInterface extends Record<TransportType, { [key: string]: any }> {
    https: {
        url: string
    },
    http: {
        url: string
    }
    dolt: {
        repository: string
    }
    s3: {
        bucket: string
        key: string
    }
}



export interface CSVLocation {
    source: 'web' | 'dolt' | 's3'
    name: string
    url?: string

    s3?: { 
        bucket: string
        key: string
    }
    unzip?: boolean
}