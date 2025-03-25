import { createTransport } from './transport'

describe('Transport test', () => {

    it('should work for an empty transport', async() => {
        const downloadTo = createTransport({ type: 'web', source: [], destination: [] })
        await downloadTo({})
        // should work
    })

})