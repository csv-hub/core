import {
	ColumnType,
	NumberColumnType,
	StringColumnType,
	DateColumnType,
	EnumColumnType,
	DecimalColumnType
} from '.'

/**
 * @type    DefinitionOf<T>
 * @desc    Maps a column type to the associated definition object.
 */
export type DefinitionOf<T extends ColumnType> = ColumnDefinition &
    (T extends EnumColumnType ? EnumDefinition :
     T extends DecimalColumnType ? DecimalDefinition :
     T extends NumberColumnType ? NumberDefinition :
     T extends 'Bool' ? BooleanDefinition :
     T extends 'Map' ? MapDefinition :
     T extends 'Array' ? ArrayDefinition :
     T extends 'Bool' ? BooleanDefinition :
     T extends StringColumnType ? StringDefinition :
     T extends DateColumnType ? DateDefinition : {})

/**
 * Specifies a type and its corresponding definition within the same object. This can be used
 * to construct objects which represent column specifications.
 */
export type ColumnSpecification<T extends ColumnType = ColumnType> = (T | ({ type: T } & DefinitionOf<T>))
export type ColumnSpecificationMap = {
    [name: string]: ColumnSpecification<ColumnType>
}

/**
 * Standard column definition keys for all columns.
 */
export interface ColumnDefinition {
    /**
     * The standard data type for the column. This is used for type resolution with ColumnSpecification, and
     * as a storage destination for the type when exporting column specifications to a string.
     */
    type?: ColumnType

    /**
     * This should only be set for column definitions outside of the standard decorator mechanism for
     * loading columns according to a TypeScript class. 
     */
    name?: string

    /**
     * Marks this column as Nullable. Allows CH to store special marker (NULL) that denotes "missing value" alongside normal values.
     * https://clickhouse.com/docs/sql-reference/data-types/nullable
     */
	optional?: boolean

    /**
     * A human-readable description of this column, used for display and AI prompting purposes.
     */
	description?: string

	/**
     * When importing from a CSV, this specifies the CSV column. 
     */
	csv?: string

    /**
     * When importing from an NDJSON or JSON source, specify a particular key that is mapped to this one
     */
    mapKey?: string

    /**
     * Assigns a default value to this column. This value is assumed to have passed type and safety checks,
     * and is not passed to any further parsers before being submitted to the database.
     */
    defaultValue?: any

    /**
     * If there is a parsing error, use the default value as the value for this column, and do not mark the
     * cell as having an invalid value.
     */
    defaultValueOnError?: boolean

    /**
     * Throws the original error which caused fallback to a default value.
     */
    errorToDefaultValue?: boolean

	/**
     * Sets the default value expression for this column, used on DDL statement to specify how a default
     * value should be calculated for this column value (e.g. "now()").
     */
	defaultExpr?: string
}

/**
 * @interface   BooleanDefinition
 * @desc        Additional definition parameters for a Bool type column.
 */
export interface BooleanDefinition {
    // For booleans
	trueValue?: any
	falseValue?: any
}

export interface EnumDefinition {
    values?: string[] | { [key: string]: number }

    emptyStringNull?: boolean

    // Convert values with string transformations
    substring?: number | [ number, number ]
    replace?: RegExp
    replaceWith?: string
    
    uppercase?: boolean
    lowercase?: boolean
}

export interface NumberDefinition {
    min?: number
    max?: number

    removeSign?: boolean    // Remove negative sign, used in CSV parsing
}

/**
 * @interface   DecimalDefinition
 * @desc        Additional definition parameters for a Decimal, Decimal32, Decimal64, etc type column.
 */
export interface DecimalDefinition {
    /**
     * Determines how many decimal digits number can have (including fraction). By default, the precision is 10.
     */
    precision?: number

    /**
     * Determines how many decimal digits fraction can have.
     */
	scale?: number

    /**
     * Represents this decimal with a Decimal or BigDecimal instance instead of the
     * native JS number type, which inherently represents decimal values as floats.
     */
    precise?: boolean

}

export interface DateDefinition {
    format?: string			// date format to parse
	timezone?: string
    precision?: number
    utc?: boolean
}

export interface StringDefinition {
	lowCardinality?: boolean
	length?: number
    padLeft?: string            // if the string is less than the fixed length, pad left with the given character
	ngrams?: number				// Indicates full text searching
}

export interface MapDefinition {
    keyType?: ColumnSpecification<NumberColumnType | StringColumnType | DateColumnType>
	valueType?: ColumnSpecification

    // For parsing from strings
    separator?: string      // default ","
    assignment?: string     // default "="
}

export interface ArrayDefinition {
    elementType?: ColumnSpecification

    // For string parsing
    separator?: string          // defaults to comma
}
