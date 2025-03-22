# CSV

This module is imported with `core/csv`.

```typescript
import { CSVFile } from '@csvhub/core/csv'

// TODO: create examples
```

## Transports

A CSV transport creates a temporary directory where "transported" (i.e. downloaded) files are placed. This 
allows unzipping, exporting, and other transport-specific processes to be performed within the transport
implementation, as long as the operation produces a valid CSV file or directory location to extract
files from.

### Http transport

