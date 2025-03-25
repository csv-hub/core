'use server'

import type { 
    ColumnTransform, 
    ColumnTransformNative
} from '../transform/types'

import { 
    getColumnTypeDefinition,
    stringToNativeTransform,
    nativeToStringTransform,
    nativeToDatabaseTransform,
    databaseToNativeTransform
} from '../transform'

import {
    ColumnType,
    DefinitionOf, 
    NativeTypeOf
} from '../types'

// import { parser } from './parser'

export class Column<T extends ColumnType = ColumnType> {
    type: T
    def: DefinitionOf<T>
    name: string

    // Transformer functions loaded on column initialization (prevents overhead
    // from checking if function is defined if lazy-loading these values)
    stringToNative: ColumnTransform<T, string>
    nativeToString: ColumnTransformNative<T, string>

    // Manage conversion between database type and Node.js type
    nativeToDatabase: ColumnTransformNative<T>
    databaseToNative: ColumnTransform<T>

    constructor(name: string, type?: T, def?: DefinitionOf<T>) {
        this.name = name
        if (type)
            this.setType(type, def)
    }

    setType(type: T, def?: DefinitionOf<T>) {
        this.type = type
        this.def = def || ({} as DefinitionOf<T>)

        // Preload functions for data transformations
        this.stringToNative = stringToNativeTransform(this.type, this.def)
        this.nativeToString = nativeToStringTransform(this.type, this.def)

        this.nativeToDatabase = nativeToDatabaseTransform(this.type, this.def)
        this.databaseToNative = databaseToNativeTransform(this.type, this.def)
    }
    
    // TRANSFORMATION FUNCTIONS
    // These functions map an arbitrary value to the specified transformation result based on the
    // configured type of this column.

    /**
     * Calls the stringToNative transformation to 
     * @param value 
     * @returns 
     */
    transformFromString(value: string): NativeTypeOf<T> | undefined {
        // Check for no type configured or for nullable types
        if (! this.type)
            return value as NativeTypeOf<T>
        if (value == null && this.def.optional)
            return null

        // Otherwise return the transformation function or fall back to a default value
        try {
            return this.stringToNative(value)
        }
        catch (error) {
            // Return nullable if empty string is not a valid value
            if (value == '' && this.def.optional)
                return null
            // If the default value should be returned on error
            if (this.def.defaultValueOnError)
                return this.def.defaultValue
            // Throw the column error
            throw error
        }
    }

    transformToString(value: NativeTypeOf<T>): any {
        if (value == null)
            return ''
        try {
            return this.nativeToString(value)
        }
        catch (error) {
            // TODO: handle stringify error
            throw error
        }
    }
    
    transformToDatabase(value: NativeTypeOf<T>): any {
        if (value == null)
            return null
        
        try {
            return this.nativeToDatabase(value)
        }
        catch (error) {
            // TODO: handle database error
            throw error
        }
    }

    transformFromDatabase(value: any): NativeTypeOf<T> {
        if (value == null)
            return null
        try {
            return this.databaseToNative(value)
        }
        catch (error) {
            // TODO: handle errors
            return undefined
        }
    }

    getName() {
        return this.name
    }

    getDefinition() {
        return this.def
    }

    hasType() {
        return this.type != null
    }

    getDataDefinition(): string {
        const spec: string[] = []
        spec.push(this.name)
        spec.push(' ')
        spec.push(getColumnTypeDefinition(this.type, this.def))
        return spec.join('')
    }

    isRequired() {
        return this.def.optional !== true
    }

    getAssistantPrompt(): string {
        const prompt: string[] = [' - `', this.name, '` of type `', getColumnTypeDefinition(this.type, this.def), '`']
        if (this.def.name)
            prompt.push(' - ', this.def.name)
        if (this.def.description)
            prompt.push(', ', this.def.description)
        return prompt.join('')
    }
}