import { DateColumnType, DateDefinition } from '../../types'
import {
    ColumnTransformBuilder,
    ColumnTransformNativeBuilder
} from '../types'

import { dateFormatter } from '../date/formatter'
import { dateFormatParser } from '../date/parser'

export function stringToDate(time = false): ColumnTransformBuilder<DateColumnType> {

    return function(def: DateDefinition) {
        if (def.format)
            return dateFormatParser(def.format, def.utc)
        
        return function(value: string): Date {
            const date = new Date(value)
            if (! time) {
                date.setHours(0)
                date.setMinutes(0)
                date.setSeconds(0)
                date.setMilliseconds(0)
            }
            return date
        }
    }
}

export function dateFormatToDate(format = 'YYYY-MM-DD') {
    return function(def: DateDefinition) {
        return dateFormatParser(format, def.utc)
    }
}

export function dateToDateString(format = 'YYYY-MM-DD'): ColumnTransformNativeBuilder<DateColumnType> {
    return function(def: DateDefinition) {
        const formatter = dateFormatter(format, def.utc)
        return (date: any) => ((date instanceof Date) ? formatter(date) : date)
    }
}

export function dateToTimestamp(seconds = false): ColumnTransformNativeBuilder<DateColumnType> {
    // For DateTime, resolution is 1 second
    if (seconds)
        return function(def: DateDefinition) {
            return (date: any) => ((date instanceof Date) ? Math.round(date.getTime() / 1000) : date)
        }
    
    // For DateTime64, resolution is in milliseconds
    return function(def: DateDefinition) {
        return (date: Date) => ((date instanceof Date) ? date.getTime() : date)
    }
}

export function dateTypeDefinition(type: DateColumnType, def: DateDefinition) {
    switch (type) {
    case 'DateTime': 
        if (def.timezone) return `DateTime('${ def.timezone }')`
        else break
    case 'DateTime64': 
        if (def.timezone && def.precision != null)
            return `DateTime64(${ def.precision }, '${ def.timezone }')`
        else if (def.precision != null)
            return `DateTime64(${ def.precision })`
        else break
    }
    return type
}

export function dateToString(time = false): ColumnTransformNativeBuilder<DateColumnType> {

    return function(def: DateDefinition) {
        return (value: Date) => value.toISOString()
    }

}