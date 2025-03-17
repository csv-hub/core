import { BooleanDefinition } from '../../types'

export function stringToBoolean() {

    return function(def: BooleanDefinition) {
        const trueValue = def.trueValue || 'true'
        const falseValue = def.falseValue || 'false'
        
        return function(value: string): boolean {
            return value === trueValue
        }
    }
}