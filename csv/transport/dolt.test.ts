
import { getTransport } from './transport'
import { 
    createTemporaryDirectory,
    directoryHasFile,
    removeDirectory
} from '../util/filesystem'


describe('Dolt Transport', () => {

    it('should transport US treasury rates', async () => {
        const tmpdir = createTemporaryDirectory('test')

        const transport = getTransport({
            type: 'dolt',
            source: {
                repository: 'post-no-preference/rates',
                name: 'table'
            },
            destination: {
                source: 'table/us_treasury.csv',
                file: 'us_treasury.csv'
            }
        })

        await transport(tmpdir)
        expect(directoryHasFile(tmpdir, 'us_treasury.csv')).toEqual(true)
        removeDirectory(tmpdir)
    })

    
})