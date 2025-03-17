
export type DateParser = (dateString: string) => Date
export type DateValidator = (dateString: string) => boolean

export type DateParserBuilder = (date: Date, match: string, utc?: boolean) => any
export type DateParserSequence = Array<DateParserBuilder | null>

export type DateFormatFunction = (date: Date, utc?: boolean) => string | number
export type DateFormatterSequence = Array<DateFormatFunction | string>

export type DateFormat = 'MM' | 'DD' | 'YY' | 'YYYY' |
  			  	  		 'HH' | 'h' | 'hh' | 'mm' | 'ss' | 'nnn' |
				  		 'M' | 'Month' | 'D' | 'Day' | 'Date' | 'Year' | 'TT' | 'tt'
