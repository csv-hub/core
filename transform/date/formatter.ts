import {
	DateFormat,
	DateFormatFunction,
	DateFormatterSequence
} from './type'

import {
	MonthName,
	DayName
} from './constant'

import { DateFormatRegex } from './regex'

export function dateFormatter(dateFormat: string, utc?: boolean): (date: Date) => string {
	const format: DateFormatterSequence = dateFormat.split(DateFormatRegex)
					 .filter((part) => part.length > 0)
					 .map((part: DateFormat) => DateFormatter[part] || part)

	return (date: Date) => {
		return format.map((formatPart) => ((typeof formatPart === 'function') ? formatPart(date, utc) : formatPart)).join('')
	}
}

const zeroPad = (num: number) => (num < 10 ? ('0' + num) : num)

const DateFormatter: Record<DateFormat, DateFormatFunction> = {
	'M': (date, utc) => ((utc ? date.getUTCMonth : date.getMonth).call(date) + 1),
	'MM': (date, utc) => zeroPad((utc ? date.getUTCMonth : date.getMonth).call(date) + 1),
	'D': (date, utc) => ((utc ? date.getUTCDate : date.getDate).call(date) + 1),
	'DD': (date, utc) => zeroPad((utc ? date.getUTCDate : date.getDate).call(date) + 1),
	'YY': (date, utc) => (utc ? date.getUTCFullYear : date.getFullYear).call(date).toString().substring(2),
	'YYYY': (date, utc) => (utc ? date.getUTCFullYear : date.getFullYear).call(date),
	'HH': (date, utc) => {
		const hour = (utc ? date.getUTCHours : date.getHours).call(date)
		return (hour == 0) ? 12 : (hour <= 12 ? hour : (hour - 12))
	},
	'TT': (date, utc) => (((utc ? date.getUTCHours : date.getHours).call(date) < 12) ? 'AM' : 'PM'),
	'tt': (date, utc) => (((utc ? date.getUTCHours : date.getHours).call(date) < 12) ? 'am' : 'pm'),
	'h': (date, utc) => (utc ? date.getUTCHours : date.getHours).call(date),
	'hh': (date, utc) => zeroPad((utc ? date.getUTCHours : date.getHours).call(date)),
	'mm': (date, utc) => zeroPad((utc ? date.getUTCMinutes : date.getMinutes).call(date)),
	'ss': (date, utc) => zeroPad((utc ? date.getUTCSeconds : date.getSeconds).call(date)),
    'nnn': (date, utc) => zeroPad((utc ? date.getUTCMilliseconds : date.getMilliseconds).call(date)),
	// 'M': (date, utc) => ShortMonthName[(utc ? date.getUTCMonth : date.getMonth).call(date)],
	'Month': (date, utc) => MonthName[(utc ? date.getUTCMonth : date.getMonth).call(date)],
	// 'D': (date, utc) => ShortDayName[(utc ? date.getUTCDay : date.getDay).call(date)],
	'Day': (date, utc) => DayName[(utc ? date.getUTCDay : date.getDay).call(date)],
	'Date': (date, utc) => {
		const d = (utc ? date.getUTCDate : date.getDate).call(date)
		if (d % 10 == 1 && d != 11)
			return d + 'st'
		if (d % 10 == 2 && d != 12)
			return d + 'nd'
		if (d % 10 == 3 && d != 13)
			return d + 'rd'
		return d + 'th'
	},
	'Year': (date, utc) => (utc ? date.getUTCFullYear : date.getFullYear).call(date)
}
