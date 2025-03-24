import { 
    ColumnSpecificationMap,
    TransportDefinition
} from '.'

/**
 * This is a description of a schema used to generate a table name and other relevant metadata.
 */
export interface TableDefinition {
    // Appended before the table name as [dataset]_[table name]
    dataset?: string

    // The table's name
    name?: string

    // Possible versions, appended after the table name as [dataset]_[table name]_[version].
	// If the version is not specified, the table name defaults to [dataset]_[table name].
    version?: string
    defaultVersion?: string
    versions?: string[]

	// ClickHouse table engine and replication settings
	engine?: TableEngine
    replicated?: {
        // If set to true, sharding and replica are automatically set
        cloud?: boolean

    }

	/**
     * In most cases you do not need a partition key, and in most other cases you do not need a partition key more granular than by months.
     * You should never use too granular of partitioning. Don't partition your data by client identifiers or names. Instead, make a client 
     * identifier or name the first column in the ORDER BY expression.
     * 
     * https://clickhouse.com/docs/engines/table-engines/mergetree-family/custom-partitioning-key
     */
	partitionBy?: string | string[]

    /**
     * The ordering keys
     */
	orderBy?: string | string[]

    /**
     * Primary key expression
     */
    primaryKey?: string

    /**
     * MergeTree setting
     */
    indexGranularity?: number

	// Asterisk settings
	asterisk?: {
		includeMaterialized?: boolean
		includeAlias?: boolean				// asterisk_include_alias_columns
	}

    /**
     * The CSV source location for data that should be inserted into this table. The csvHeader flag
     * can be set to "false" to indicate that the CSV source file does not have a header row.
     */
    csv?: SourceLocation | SourceVersionLocation
    csvHeader?: boolean

	/**
	 * To import data for this schema from an NDJSON file.
	 */
	ndjson?: SourceLocation | SourceVersionLocation

    transport?: TransportDefinition | ((version?: string) => TransportDefinition)

    /**
     * Table metadata
     */
    title?: string
    subtitle?: string
    description?: string
    updated?: Date
}

/**
 * Exported to client and used in code generation
 */
export interface TableSpecification {
    name: string
    definition: TableDefinition
    column: ColumnSpecificationMap
}

// export type TableDefinitionWithName = { name: string } & TableDefinition

// CSV location utilities
export type SourceLocation = string | string[]
export type SourceVersionLocation = (version?: string) => SourceLocation


export type TableEngine = MergeTreeEngine | LogEngine

export type MergeTreeEngine = 'MergeTree' | 'ReplacingMergeTree' | 'SummingMergeTree' | 'AggregatingMergeTree' | 'CollapsingMergeTree' | 'VersionedCollapsingMergeTree' | 'GraphiteMergeTree'
export type LogEngine = 'Log' | 'TinyLog' | 'StripeLog'