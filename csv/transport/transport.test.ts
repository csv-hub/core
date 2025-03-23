import { getTransport } from './transport'

describe('Transport test', () => {

    it('should work for an empty transport', async() => {
        const downloadTo = getTransport({ type: 'web', source: [], destination: [] })
        await downloadTo('/not/a/directory')
        // should work
    })

})