import type { NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common/exceptions/application.exception";
import { ZodError, ZodType } from "zod";


type ValidationKey = keyof Request
type ValidationSchema = Partial<Record<ValidationKey, ZodType>>
export const validation = (schema: ValidationSchema) => {
    return ((req: Request, res: Response, next: NextFunction) => {
        let validationError: { key: ValidationKey, issue: ZodError["issues"] }[] = []
        if(req.files) req.body.files = req.files as Express.Multer.File[]
        if(req.file) req.body.file = req.file as Express.Multer.File
        for (const key of Object.keys(schema) as ValidationKey[]) {
            if (!schema[key]) {
                continue
            }
            console.log(req[key])
            const value = schema[key].safeParse(req[key])
            if (!value.success) {
                validationError.push({ key, issue: value.error.issues })
            }
        }
        if (validationError.length > 0) {
            throw new BadRequestException('Validation error', validationError)
        }
        next()
    })
}