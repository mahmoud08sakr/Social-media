import { Response } from "express"



export const SuccessResponce = (
    { res, message = 'success', status = 200, data
    }: {
        res: Response,
        message?: string,
        status?: number,
        data?: any
    }
) => {
    return res.status(status).json({
        message, data
    })
}