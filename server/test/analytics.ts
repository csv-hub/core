import { Database } from '..'

export default function(db: Database) {
    const table = db.tableDecorator()
    const column = db.columnDecorator()

    @table('jest_page_visit', {
        engine: 'MergeTree',
        partitionBy: 'url',
        orderBy: 'time'
    })
    class PageVisit {
        @column('UUID')
        user: number

        @column('DateTime')
        time: Date

        @column('String', {
            lowCardinality: true
        })
        url: string
    }
    
    @table('jest_page_visit_summing', {
        engine: 'SummingMergeTree'
    })
    class SummingPageVisit extends PageVisit {}

    function generatePageVisits({ pastDays = 30, count = 1000, uuidRepeat = 0.1, urls = ['/'] }: {
        pastDays?: number   // past duration in days
        count?: number      // 
        uuidRepeat?: number // chance of picking a repeated UUID
        urls?: string[]     // list of URLs
    }): PageVisit[] {
        const visits = []
        const uuids: string[] = []

        for (let i = 0 ; i < count ; i++) {
            const generateUUID = Math.random() < uuidRepeat && uuids.length > 0
            const user = generateUUID ? crypto.randomUUID() : randomValue(uuids)
            if (generateUUID)
                uuids.push(user)

            visits.push({
                user,
                time: new Date(Date.now() - Math.random() * pastDays * 86400000).getTime(),
                url: randomValue(urls)
            })
        }
        return visits as PageVisit[]
    }

    function randomValue(array: any[]) {
        return array[Math.floor(Math.random() * array.length)]
    }

    return { PageVisit, SummingPageVisit, generatePageVisits }
}