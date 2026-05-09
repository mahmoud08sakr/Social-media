import express from "express"
import type { Express, Request, Response } from "express"
import cors from "cors"

import { authRouter } from "./modules"
import { globalErrorHandler } from "./middleware"
import { env } from "./config/env.service"
import DBConnection from "./database/connection"
import { redisService } from "./common/services/redis.service"
import { userRouter } from "./modules"
import { SuccessResponce } from "./common/exceptions/success.responce"
import { BadRequestException } from "./common/exceptions/application.exception"
import { pipeline } from 'stream'
import { promisify } from 'util'
import { s3Service } from "./common/services/s3.service"
const s3GetFile = promisify(pipeline)
export const bootstrap = async () => {
    const app: Express = express()

    app.use(cors(), express.json())

    await DBConnection()

    redisService.connect()

    app.get('/uploads/*path', async (req: Request, res: Response) => {
        console.log(req.params);
        let { download, fileName } = req.query
        let { path } = req.params as { path: string[] }
        if (path.length == 0) {
            throw new BadRequestException("path not found")
        }
        let key = path.join('/')
        let { Body, ContentType } = await s3Service.getAsset({ Key: key })

        s3GetFile(Body as NodeJS.ReadableStream, res)
        res.setHeader(
            "Content-Type",
            ContentType || "application/octet-stream"
        );
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download == "true") {

            res.setHeader("Content-Disposition", `attachment; filename="${fileName || key.split("/").pop()}"`);
        }
        return res
        // SuccessResponce({ res, message: "User profile data", data: key })

    })

    app.get('/presign/*path', async (req: Request, res: Response) => {
        console.log(req.params);
        let { download, fileName } = req.query as { download: string, fileName: string }
        let { path } = req.params as { path: string[] }
        if (path.length == 0) {
            throw new BadRequestException("path not found")
        }
        let key = path.join('/')
        let url = await s3Service.createPresignFetshUrl({ Key: key, fileName, download })

        SuccessResponce({ res, data: url })
        // s3GetFile(Body as NodeJS.ReadableStream, res)
        // res.setHeader(
        //     "Content-Type",
        //     ContentType || "application/octet-stream"
        // );
        // res.set("Cross-Origin-Resource-Policy", "cross-origin");
        // if (download == "true") {

        //     res.setHeader("Content-Disposition", `attachment; filename="${ fileName || key.split("/").pop()}"`);
        // }
        // return res
        // SuccessResponce({ res, message: "User profile data", data: key })

    })
    app.use('/auth', authRouter)
    app.use('/users', userRouter)
    app.use(globalErrorHandler)
    app.listen(env.port, () => {
        console.log(`server is running on port ${env.port}`);
    })
}