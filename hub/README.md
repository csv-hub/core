# CSV Hub



The `CSVHub` and `CSVDataset` are symbolic representations of the main directory where datasets are stored.
They provide an abstraction layer for interaction with the file system and the underlying packages.

```
.
|- data                 # Datasets
|  |- ppp               # PPP loans
|  |  |- package.json   # Configuration
|  |  |- tsconfig.json  # Typescript
|  |  |- table          # Data tables
|  |  |- dictionary     # Data dictionaries
|  |  |- component      # React components

|  |- fec      # FEC data
|  |- ...
```

The Next.js application is automatically configured to search for a sibling `data` directory to use as the
default folder space where datasets are stored. To specify a different data directory, use the `CSVHUB_DIR` 
environment variable to specify the absolute path of the directory.

## `CSVHub`

- list datasets
- create a new dataset
- read an existing dataset
- remove a dataset

## `CSVDataset`

- list tables in `table` directory
- list dictionaries in `dictionary` directory
- list React components in `component`
- list MDX files in `page` directory
- load a table, given its transport strategy

## `CSVLogger`

- functions for logging server activity