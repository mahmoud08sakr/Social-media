"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const env_service_1 = require("./config/env.service");
const connection_1 = __importDefault(require("./database/connection"));
const redis_service_1 = require("./common/services/redis.service");
const modules_2 = require("./modules");
const success_responce_1 = require("./common/exceptions/success.responce");
const application_exception_1 = require("./common/exceptions/application.exception");
const stream_1 = require("stream");
const util_1 = require("util");
const s3_service_1 = require("./common/services/s3.service");
const s3GetFile = (0, util_1.promisify)(stream_1.pipeline);
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    await (0, connection_1.default)();
    redis_service_1.redisService.connect();
    app.get('/uploads/*path', async (req, res) => {
        console.log(req.params);
        let { download, fileName } = req.query;
        let { path } = req.params;
        if (path.length == 0) {
            throw new application_exception_1.BadRequestException("path not found");
        }
        let key = path.join('/');
        let { Body, ContentType } = await s3_service_1.s3Service.getAsset({ Key: key });
        s3GetFile(Body, res);
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download == "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || key.split("/").pop()}"`);
        }
        return res;
        // SuccessResponce({ res, message: "User profile data", data: key })
    });
    app.get('/presign/*path', async (req, res) => {
        console.log(req.params);
        let { download, fileName } = req.query;
        let { path } = req.params;
        if (path.length == 0) {
            throw new application_exception_1.BadRequestException("path not found");
        }
        let key = path.join('/');
        let url = await s3_service_1.s3Service.createPresignFetshUrl({ Key: key, fileName, download });
        (0, success_responce_1.SuccessResponce)({ res, data: url });
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
    });
    app.use('/auth', modules_1.authRouter);
    app.use('/users', modules_2.userRouter);
    app.use(middleware_1.globalErrorHandler);
    app.listen(env_service_1.env.port, () => {
        console.log(`server is running on port ${env_service_1.env.port}`);
    });
};
exports.bootstrap = bootstrap;
