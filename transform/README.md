# Transforms

Clickizen is a tool that operates on largely unsanitized data, so accurate value transformation is crucial when
reading from a diverse range of data sources. There are five transformations implemented for each ClickHouse data type,
listed below - the term "native" refers to a native type used for storing the value in Node.JS like `number` or `BigInt`.

- [any value to native](#any-to-native)
- [string to native](#string-to-native)
- [database to native](#database-to-native)
- [native to database](#native-to-database)
- [native to string](#native-to-string)

## Any to native

Takes any value, and either produces a valid native value for the type, or throws a parsing error.

## String to native

Parse the value from a string (used in CSV imports) into the native type.

```typescript
const parseDate = stringToNativeTransform('Date', { format: 'MM/DD/YYYY' })
parseDate('01/12/2011') // produces Date instance
parseDate('invalid')    // throws InvalidDateError
```

## Database to native

Parse the value from the stored database value. This is a faster function which does
not do any validation on the value returned, only necessary transformations (e.g. converting to `BigDecimal`).

## Native to database

Convert the native value into the format accepted by ClickHouse

## Native to string

Convert the native value to a string value, designed for CSV export

## Native to JSON

Convert the native value to a JSON compatible value