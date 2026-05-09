import multer from "multer"
import { tmpdir } from "os"
import { MulterEnum } from "../../enums/multer.enums";
import type { Request } from "express";
export const uploadFile = ({
    storageKey = MulterEnum.memoryStorage
}:
    {
        storageKey?: MulterEnum
    }) => {
    const storage = storageKey == MulterEnum.memoryStorage ? multer.memoryStorage() : multer.diskStorage({
        destination(req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) {
            callback(null, tmpdir())
        },
        filename(req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname
            callback(null, `${file.fieldname}-${uniqueSuffix}`)
        },
    })

    return multer({ storage })
}