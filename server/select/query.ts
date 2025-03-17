import { isProgressRow, JSONDataFormat, QueryResult, ResponseJSON, ResultSet } from '@clickhouse/client'
import { Table } from '..'
import { AnyClass, AnyObject, ColumnObject } from '../types'

export class SelectQuery<T extends AnyClass> {
    private table: Table<T>
    private next?: SelectQuery<T>
    private previous?: SelectQuery<T>
    
    private selectExpr: string[] = []
    private selectDistinct?: boolean
    private selectDistinctColumn?: Set<string>
    private replaceExpr?: { [col: string]: string }
    private exceptColumn?: Set<string>
    private applyFunctions?: string[]
    private groupExpr?: string[]
    private orderExpr?: string[]
    private orderDirection?: 'ASC' | 'DESC'

    // max_memory_usage setting
    maxMemoryUsage?: number

    constructor(table: Table<T>) {
        this.table = table
    }

    thenSelect(...exprs: string[]): SelectQuery<T> {
        const nextQuery = new SelectQuery(this.table)
        if (exprs.length > 0)
            nextQuery.columns(...exprs)

        this.next = nextQuery
        nextQuery.previous = this

        return nextQuery
    }

    topK<I = ColumnObject<T>>(column: keyof I, { top = 10, loadFactor = 3, weight }: { 
        top: number
        loadFactor: number
        weight?: keyof I
    }) {
        // Weight by column
        if (weight != null)
            return this.columns(`topKWeighted(${ top })(${ String(column) }, ${ String(weight) })`)
        // Return topK
        return this.columns(`topK(${ top }, ${ loadFactor })(${ String(column) })`)
    }

    /**
     * Selecting distinct without specifying columns is equivalent to adding the DISTINCT
     * keyword after SELECT. When specifying column names (they cannot be expressions)
     * 
     * @param columns 
     * @returns 
     */
    distinct<I = ColumnObject<T>>(...columns: Array<keyof I>) {
        this.selectDistinct = true

        // If distinct columns specified
        if (columns.length > 0) {
            if (! this.selectDistinctColumn)
                this.selectDistinctColumn = new Set()
            for (const column of columns)
                this.selectDistinctColumn.add(column as string)
        }

        return this
    }

    // Produces an asterisk if search not specified
    // Select all columns that match the search string
    // produces the expression COLUMNS('search')
    allColumns(search?: string): this {
        this.selectExpr.push('*')
        return this
    }

    columns(...exprs: Array<string | Record<string, string>>): this {
        for (const expr of exprs) {
            if (typeof expr === 'string')
                this.selectExpr.push(expr)
            else for (const name of Object.keys(expr))
                this.selectExpr.push(name == expr[name] ? name : `${ expr[name] } AS ${ name }`)
        }
        return this
    }

    exceptColumns(...cols: string[]): this {
        if (! this.exceptColumn)
            this.exceptColumn = new Set()
        for (const col of cols)
            this.exceptColumn.add(col)
        return this
    }

    // Apply the function on each row (e.g. apply('sum') aggregates all columns)
    applyFunction(func: string): this {
        if (! this.applyFunctions)
            this.applyFunctions = []
        this.applyFunctions.push(func)
        return this
    }

    replace(column: string, expr: string): this {
        if (! this.replaceExpr)
            this.replaceExpr = {}
        this.replaceExpr[column] = expr
        return this
    }

    groupBy(...exprs: string[]): this {
        if (! this.groupExpr)
            this.groupExpr = []
        this.groupExpr.push.apply(this.groupExpr, exprs)
        return this
    }

    orderBy(...exprs: string[]): this {
        if (! this.orderExpr)
            this.orderExpr = []
        this.orderExpr.push.apply(this.orderExpr, exprs)
        return this
    }

    ascending(): this {
        this.orderDirection = 'ASC'
        return this
    }

    orderAscendingBy(...exprs: string[]): this {
        return this.orderBy(...exprs).ascending()
    }

    descending(): this {
        this.orderDirection = 'DESC'
        return this
    }

    orderDescendingBy(...exprs: string[]): this {
        return this.orderBy(...exprs).descending()
    }

    toString(pretty = false) {
        // Start a select expression
        const expr: string[] = ['SELECT ']
        if (this.selectDistinct)
            expr.push('DISTINCT ')
        if (this.selectDistinctColumn)
            expr.push('ON (', Array.from(this.selectDistinctColumn).join(', '), ') ')
        
        // Add all select expressions separate by commas, no space before and one space after
        expr.push(pretty ? '\n  ' : '')
        expr.push(this.selectExpr.join(pretty ? ',\n  ' : ', '))
        expr.push(pretty ? '\n' : ' ')

        // From data source
        expr.push('FROM ', (this.previous) ? `(${ this.previous.toString(pretty) })` : this.table.getName())
        // TODO: query chaining - generate the child query in here
        
        // Add grouping
        if (this.groupExpr) {
            expr.push(pretty ? '\n' : ' ')
            expr.push('GROUP BY ')
            expr.push(this.groupExpr.join(', '))
        }

        // Add ordering
        if (this.orderExpr) {
            expr.push(pretty ? '\n' : ' ')
            expr.push('ORDER BY ')
            expr.push(this.orderExpr.join(', '))
            if (this.orderDirection)
                expr.push(' ', this.orderDirection)
        }

        return expr.join('')
    }

    private executeQuery<Format extends JSONDataFormat>(format: Format): Promise<QueryResult<Format>> {
        return this.table.getClient().query({
            query: this.toString(),
            format
        })
    }

    async execute(): Promise<ResponseJSON> {
        // console.log(this.toString(true))
        const result = await this.executeQuery('JSON')
        return await result.json()
    }

    async stream<D extends AnyObject>() {
        const result = await this.executeQuery('JSONEachRow')
        return result.stream<D>()
    }

    async eachWithProgress(handler: (data: AnyObject) => any, progress: (data: any) => any) {
        const result = await this.executeQuery('JSONEachRowWithProgress')
        const stream = result.stream()
        for await (const rows of stream) {

        }
        // isProgressRow()

    }
}