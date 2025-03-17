# Decorator files

A decorator file contains metadata and useful typings for interacting with some external resource.
The main benefits of decorators are that the same TypeScript file can be adapted for use on both the
client and server side.

# Table decorator

## `@table()`

The `table` decorator is a class decorator to define the columns of a table with a class definition.

```
TODO: example
```

## `@column()`

Specifies a column.

```typescript
@table('points')
class Point {

    @column('UInt16')
    x: number

    @column('UInt16')
    y: number

    
}

```

Behind the scenes, when the class is registered with a `Database` instance, 

## `@expr()`

Defines a reusable expression. In the runtime this is implemented as a string, so it is consistent
between the client and server. The metadata attached to this expression is used to improve the results
of AI querying.

```typescript
@expr({
    title: 'Weighted average'
})
static get weightedAverage() { return 'avg' }
```

```typescript
ppp.select(Loan.weightedAverage) 
```