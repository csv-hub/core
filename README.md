# `@csv-hub/core`

This module contains the open-core functionality of [CSVHub](https://csvhub.org). It aims to provide a complete
implementation of all [ClickHouse data types](https://clickhouse.com/docs/sql-reference/data-types), along with robust 
functions for working with these values, and an abstraction layer which makes it easy to pass sanitized queries between
the server and client.

## Submodules

The main exported module is only a collection of TypeScript types, which allows both client and server applications to
reference shared interfaces.

```typescript
import type { /*...*/ } from '@csvhub/core'
```

The submodules of `@csvhub/core` are:

- [data](./data/README.md) - abstraction layer for managing tables, data, and resources of a ClickHouse database
- [csv](./csv/README.md) - abstraction layer for managing CSV files and fetching data from remote sources
- [decorator](./decorator/README.md) - enables decorators in dataset implementation
- [transform](./transform/README.md) - value transformations for each data type

## ROADMAP

### High priority

- Implement the main `CSVHub` and `CSVDataset` classes

### Medium priority

- **Work with [nested data declarations](https://clickhouse.com/docs/sql-reference/data-types/nested-data-structures/nested)**. This would
require a new `nested` decorator which references another class with `@column` decorators. 

### Low priority

- **Robust handling of large numbers**. Currently the [number transformations](./transform/type/number.ts) could be
improved, and some additional testing to ensure decimal values do not lose precision in JS is required.


- Add some syntactic sugar for building expressions with ClickHouse functions