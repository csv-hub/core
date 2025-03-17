import { DateFormat, DateParserBuilder } from './type'
import { MonthName } from './constant'

/**
 * Relies on an internal flag set within the Date object to store the parsed hour.
 */
const ampmParser = (am: string, pm: string): DateParserBuilder => {
	return (date: any, match, utc) => {
		if (date['__hh'] != null) return
		const hour = date['__HH']
		if (hour == null || typeof hour !== 'number') return
		if (match == am && hour == 12)
			(utc ? date.setUTCHours : date.setHours).call(date, 0);
		if (match == pm && hour < 12)
			(utc ? date.setUTCHours : date.setHours).call(date, hour + 12)
	}
}

/**
 * Parses the hour and sets the corresponding flag within the Date object so further parsing
 * of AM/PM designation is handled properly.
 * @param flag 
 * @returns 
 */
const hourParser = (flag: string): DateParserBuilder => {
	return (date: any, match, utc) => {
		const hour = parseInt(match);
		(utc ? date.setUTCHours : date.setHours).call(date, hour);
		date[flag] = hour
	}
}

const monthParser: DateParserBuilder = (date, match, utc) => (utc ? date.setUTCMonth : date.setMonth).call(date, parseInt(match) - 1)
const dateParser: DateParserBuilder = (date, match, utc) => (utc ? date.setUTCDate : date.setDate).call(date, parseInt(match))
const yearParser: DateParserBuilder = (date, match, utc) => (utc ? date.setUTCFullYear : date.setFullYear).call(date, parseInt(match) + (match.length == 2 ? 2000 : 0))

export const DateParserMatch: Record<DateFormat, DateParserBuilder> = {
	'M': monthParser,
	'MM': monthParser,
	'D': dateParser,
	'DD': dateParser,
	'YY': yearParser,
	'YYYY': yearParser,
	'TT': ampmParser('AM', 'PM'),
	'tt': ampmParser('am', 'pm'),
	// Set date with flag to note that there is an absolute or AM/PM hour set
	'h': hourParser('__hh'),
	'hh': hourParser('__hh'),
	'HH': hourParser('__HH'),
	'mm': (date, match, utc) => (utc ? date.setUTCMinutes : date.setMinutes).call(date, parseInt(match)),
	'ss': (date, match, utc) => (utc ? date.setUTCSeconds : date.setSeconds).call(date, parseInt(match)),
    'nnn': (date, match, utc) => (utc ? date.setUTCMilliseconds : date.setMilliseconds).call(date, parseInt(match)),
	'Month': (date, match, utc) => (utc ? date.setUTCMonth : date.setMonth).call(date, MonthName.indexOf(match)),
	'Date': (date, match, utc) => (utc ? date.setUTCDate : date.setDate).call(date, parseInt(match.replace(/[^0-9]/g, ''))),
	'Year': yearParser,
	// Cannot use day of week to set date in any meaningful way
	'Day': () => {},
}
