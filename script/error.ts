import { IncomingMessage } from "http";

export class DownloadError extends Error {
    url: string
    response: IncomingMessage

    constructor(url: string, response: IncomingMessage) {
        super(`URL ${ url } return ${ response.statusCode } error`)
        this.url = url
        this.response = response
    }
}