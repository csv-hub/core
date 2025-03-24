
import { getTransport } from '../transport'
import { 
    createTemporaryDirectory,
    directoryHasFile,
    removeDirectory
} from '../../util/filesystem'


describe('Web Transport', () => {

    it('should transport Big Mac prices', async () => {
        const tmpdir = createTemporaryDirectory('test')

        const transport = getTransport({ 
            type: 'web', 
            source: [
                {
                    url: 'https://calmcode.io/static/data/bigmac.csv'
                }
            ], 
            destination: [
                {
                    source: 'bigmac.csv',
                    file: 'bigmac.csv'
                }
            ]
        })

        await transport(tmpdir)
        expect(directoryHasFile(tmpdir, 'bigmac.csv')).toEqual(true)
        removeDirectory(tmpdir)
    })

    
})