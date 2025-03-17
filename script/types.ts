
export type DownloadSource<T extends any[] = any[]> = DownloadDefinition | DownloadBuilder<T>

/**
 * A Download object can be exported to a JSON file. 
 */
export interface DownloadDefinition extends DownloadOption {
    title?: string
    url: string

    // Automatically runs this download on a schedule
    update_frequency?: 'day' | 'week' | 'month' | 'year' | number
}

export type DownloadBuilder<T extends any[] = any[]> = (...args: T) => DownloadSource

const example: DownloadDefinition = {
    title: 'Active licenses for Short-Term Residential Occupancy',
    url: 'https://seshat.datasd.org/stro_licenses/stro_licenses_datasd.csv'
}

export interface DownloadOption {
    unzip?: boolean
    mkdir?: boolean         // default true
    redirectLimit?: number  // Limit 302 redirects
}