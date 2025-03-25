
import { createTransport } from '../transport'
import { 
    createTemporaryDirectory,
    directoryHasFile,
    removeDirectory
} from '../../util/filesystem'

describe('Dolt transport', () => {

    it('should transport US treasury rates', async () => {
        const tmpdir = createTemporaryDirectory('test')

        const transport = createTransport({
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

        await transport({ destination: tmpdir })
        expect(directoryHasFile(tmpdir, 'us_treasury.csv')).toEqual(true)
        removeDirectory(tmpdir)
    })

    
})