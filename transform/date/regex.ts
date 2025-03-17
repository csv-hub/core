import { DateFormat } from './type'

export const DateFormatRegex = /(MM|DD|YYYY|YY|HH|hh|mm|ss|nnn|TT|tt|Month|Day|Date|Year|D|M|h)/g

export const DateParserRegex: Record<DateFormat, string> = {
	'M': '0?[0-9]|1[012]',
	'MM': '[01][0-9]',
	'D': '0?[1-9]|[1-2][0-9]|3[01]',
	'DD': '0[1-9]|[1-2][0-9]|3[01]',
	'YY': '\\d\\d',
	'YYYY': '\\d\\d\\d\\d',
	'HH': '0?[0-9]|1[0-2]',
	'h': '0?[0-9]|1[0-9]|2[0-3]',
	'hh': '[01][0-9]|2[0-3]',
	'mm': '[0-6]\\d',
	'ss': '[0-6]\\d',
    'nnn': '\\d\\d\\d',
	'TT': 'AM|PM',
	'tt': 'am|pm',
	// 'M': 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',
	'Month': 'January|February|March|April|May|June|July|August|September|October|November|December',
	// 'D': 'Sun|Mon|Tue|Wed|Thu|Fri|Sat',
	'Day': 'Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday',
	'Date': '[23]?1st|2?2nd|2?3rd|[4-9]th|1[0-9]th|2[4-9]th|30th',
	'Year': '\\d\\d\\d\\d'
}
