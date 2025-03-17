import { DateFormat, DateParser, DateValidator, DateParserSequence } from './type'
import { DateParserRegex, DateFormatRegex } from './regex'
import { DateParserMatch } from './builder'

import { InvalidDateError } from '../error'

function buildParser(dateFormat: string): { sequence: DateParserSequence, regex: RegExp } {
    const sequence: DateParserSequence = [ null ]
	const regex = new RegExp(dateFormat.split(DateFormatRegex)
					 .filter((part) => part.length > 0)
					 .map((part: DateFormat) => {
						 const parser = DateParserRegex[part]
						 sequence.push(parser ? DateParserMatch[part] : null)
						 return '(' + (parser || part.replace(/([^a-zA-Z0-9\s])/g, '\\$1')) + ')'
				 	 })
					 .join(''))
    return { sequence, regex }
}

export function dateFormatParser(dateFormat: string, utc?: boolean): DateParser {
	const { sequence, regex } = buildParser(dateFormat)

	return (dateString: string): Date => {
		// Split into matched parts and generate a date object
		const match = dateString.match(regex)
		if (match == null)
			throw new InvalidDateError(dateString, dateFormat)

		const date = new Date(0)
		sequence.forEach((part, index) => {
			if (part != null)
				part(date, match[index], utc)
		})
		removeFlags(date)
		return date
	}
}

export function dateFormatValidator(dateFormat: string, utc?: boolean): DateValidator {
    const { regex } = buildParser(dateFormat)

    return (dateString: string): boolean => {
        return dateString.match(regex) != null
    }
}

function removeFlags(date: any) {
	delete date['__hh']
	delete date['__HH']
}
