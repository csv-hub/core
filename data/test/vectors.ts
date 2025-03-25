import crypto from 'crypto'
import { Database } from '..'

export default function(db: Database) {
    const table = db.tableDecorator()
    const column = db.columnDecorator()

    @table('jest_vector_test', {
        engine: 'MergeTree',
        primaryKey: 'id'
    })
    class VectorWithId {
        @column('UUID')
        id: string

        @column('Array', { elementType: 'UInt16' })
        vector: number
    }

    function generateVectorsWithId(count: number, length: number): VectorWithId[] {
        const vectors = []
        for (let i = 0 ; i < 1000 ; i++) {
            vectors.push({
                id: crypto.randomUUID(),
                vector: new Array(length).fill(0).map(() => Math.floor(Math.random() * 65536))
            })
        }
        return vectors as VectorWithId[]
    }

    return { VectorWithId, generateVectorsWithId }
}