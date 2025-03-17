# `@csv-hub/core`

**NOTE:** This is still in development.

This module contains all definitions and utility functions associated with data types. It aims to provide a complete
implementation of all [ClickHouse data types](https://clickhouse.com/docs/sql-reference/data-types) along with pure 
functions to work with these values, and an abstraction layer which makes it easy to pass sanitized queries between
the server and client.

## Submodules

- [database](./database/README.md) - abstraction layer for managing tables, data, and resources in a ClickHouse database

## ROADMAP

- Work with nested data declarations
- Implement the main functions from ClickHouse

## SPRINT

- [ ] port VM execution environment for loading schemas into Database instance

## Scripts

Provide a similar runtime environment to the table/column decorators for running scripts. This would allow the
UI interface and CLI application to both be able to handle longer-running data ingestion processes.

- [ ] script runtime environment that uses decorators
- [ ] script writes progress and errors to a ClickHouse table

```typescript

@script('download')
class PPP_Scripts {
    
    @script('loans')
    async loans(
        @dir('data') dir: string,
        @version() version: string) {
        
    }
}

import fecParse from 'fec-parser'

class FEC_Scripts {

    @task('download')
    async downloadFilings(
        @param('UInt8') year: number, 
        @param('UInt8') month: number,
        @param('UInt8') date: number) {
        // automatically creates a ClickHouse row with the 
        // stream to fecParse()
    }
}
```

## Browser notes

The `react` packages consistently uses `import type` when referencing this module, to avoid pulling implementations into
the client bundle. 

## Data Types

## Browser usage

## Transforms

### Parse string to native value

The `stringParser` mapping contains every

- string parser - `(value: string) => native`

- value parser - `(value: any) => native`

- validator

## Decorators

The `decorator` submodule adds two global functions `table` and `column`.

```
import '@csv-hub/core/decorator'

@table('my_table')
class MyRow {

	@attr('UInt8')
	id: number

	@column('String')
	name: string

}
```
