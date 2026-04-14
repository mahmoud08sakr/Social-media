import express from "express"
import type { Express } from "express"
import cors from "cors"

import { authRouter } from "./modules"
import { globalErrorHandler } from "./middleware"
import { env } from "./config/env.service"
import DBConnection from "./database/connection"
import { redisService } from "./common/services/redis.service"


export const bootstrap = async () => {
    const app: Express = express()

    app.use(cors(), express.json())

    await DBConnection()

    redisService.connect()
    app.use('/auth', authRouter)
    app.use(globalErrorHandler)
    app.listen(env.port, () => {
        console.log(`server is running on port ${env.port}`);
    })
}