/**
 * A transport type is a strategy for acquiring a CSV file.
 * - web: acquire the CSV file from a web location
 * - s3: acquire the file from an S3 bucket with the given key
 * - dolt: acquire the file from the dump of a Dolt database
 * - github: clone a repository or get a specific raw file
 * - ... - future extensions
 */
export type TransportType = 'web' | 's3' | 'dolt' | 'github'

/**
 * An object which defines the transport strategy.
 */
export interface TransportDefinition<T extends TransportType = TransportType> {
    // Identifier of the transport
    type: T

    // Sources to ingest with the transportation mechanism 
    // (e.g. download from S3 bucket, clone a repo, wget a file)
    source: TransportSource<T> | Array<TransportSource<T>>

    // The destinations to write
    destination: TransportDestination | TransportDestination[]

    // Optional description
    description?: string

    // Automatically runs this transport on a schedule (number is in hours)
    update_frequency?: 'day' | 'week' | 'month' | 'year' | number

    // If set to false, will output tmp directory instead of deleting
    clean?: boolean

    // If set to true, will print transport state to standard output
    verbose?: boolean
}

export interface TransportExecutor<T extends TransportType> {
    canTransport(source: TransportSource<T>): Promise<boolean>
    transportSource(source: TransportSource<T>, destination: string, progress?: TransportProgress): Promise<any>
    afterTransportingSource(source: TransportSource<T>, destination: string): Promise<any>
}

export type TransportFunction<T extends TransportType> = (option?: TransportOption<T>) => Promise<string>

export interface TransportOption<T extends TransportType> {
    destination?: string

    onTransportStart?: (source: TransportSource<T>) => any
    onTransportFinish?: (source: TransportSource<T>) => any

    // Print output to the console
    verbose?: boolean

    // If all source files are available, don't redownload
    useCache?: boolean
}

export interface TableTransportOption { 
    destination?: string
    version?: string
    verbose?: boolean
    useCache?: boolean
}

export type TransportExecutorMap = {
    [T in TransportType]: TransportExecutor<T>
}

/**
 * A transport destination defines the mapping between a source file path and the destination file
 * path in the directory which will receive the final CSV files.
 */
export interface TransportDestination {
    // File path of the source CSV file
    source: string

    // Optional file path to write the output
    file?: string

    // Future: decompression
    unzip?: boolean

    // Future: If the source CSV file does not have headers, adds the headers during the extraction process
    addHeader?: string[]
    mapSeparator?: string
    escape?: string
    quote?: string
    trimValues?: boolean
}

/**
 * Standard handler for communicating transport progress
 */
export type TransportProgress = (completed: number, total: number, added: number) => any

/**
 * Maps transport type to the corresponding interface for defining a source
 */
export type TransportSource<T extends TransportType> = TransportSourceMap[T]
interface TransportSourceMap extends Record<TransportType, { [key: string]: any }> {
    s3: S3Source
    web: WebSource
    dolt: DoltSource
    github: GithubSource
}

/**
 * Defines an S3 source
 */
export interface S3Source {
    region?: string
    bucket: string
    
    // A prefix to include before the key
    prefix?: string
    // Determines the output file name if the "name" key is not set
    key: string
    // Explicit name to set for this S3 source file
    name?: string

    // If the ACL of the S3 bucket is set to "requester pays"
    requesterPays?: boolean
}

/**
 * Define a web source
 */
export interface WebSource {
    url: string
    name?: string           // file name to give result (otherwise will be base of URL)

    secure?: boolean
    unzip?: boolean
    mkdir?: boolean         // default true
    redirectLimit?: number  // Limit 302 redirects
}

export interface DoltSource {
    repository: string
    branch?: string         // default master
    name?: string           // local folder name
}

export interface GithubSource {
    repository: string
    branch?: string         // default master

    // Download a specific file
    file?: string           // download a specific file, otherwise clones the repository
    name?: string           // file name to output instead of standard repo path (repo name/file name)
}