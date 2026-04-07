interface AError {
    status: number,
    message: string,
    cause?: unknown
}



export class ApplicationException extends Error implements AError {
    constructor(message: string, public status: number, cause?: unknown) {
        super(message, { cause })
        this.name = this.constructor.name
    }
}



export class BadRequestException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 400,  cause )
    }
}

export class ConflictException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 409, cause )
    }
}

export class NotFoundException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 404,  cause )
    }
}