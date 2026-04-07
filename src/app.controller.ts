import express from "express"
import type { Express } from "express"
import cors from "cors"

import { authRouter } from "./modules"
import { globalErrorHandler } from "./middleware"



export const bootstrap = () => {
    const app: Express = express()

    app.use(cors(), express.json())
    app.use('/auth', authRouter)
    app.use(globalErrorHandler)
    app.listen(3000, () => {
        console.log('server is running on port 3000');
    })
}