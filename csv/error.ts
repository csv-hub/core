
export class GitRepositoryError extends Error {

    constructor() {
        super('Could not find the git repository')
    }

}