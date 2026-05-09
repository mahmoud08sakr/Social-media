"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const application_exception_1 = require("../common/exceptions/application.exception");
const token_service_1 = require("../common/services/token.service");
const redis_service_1 = require("../common/services/redis.service");
const tokenService = new token_service_1.TokenService;
const auth = async (req, res, next) => {
    let { authorization } = req.headers;
    if (!authorization) {
        throw new application_exception_1.BadRequestException("un authorized");
    }
    let [flag, token] = authorization.split(" ");
    if (!flag || !token) {
        throw new application_exception_1.BadRequestException("un authorized");
    }
    switch (flag) {
        case "Basic":
            const Basicdata = Buffer.from(token, "base64").toString();
            let [email, password] = Basicdata.split(":");
            console.log(email, "  ", password);
            break;
        case "Bearer":
            if (!authorization) {
                throw new application_exception_1.BadRequestException("un authorized");
            }
            let data = tokenService.decodeToken(token);
            console.log(data);
            let revoked = await redis_service_1.redisService.get(redis_service_1.redisService.createRevokeKey({
                userId: data.id,
                token
            }));
            if (revoked !== null) {
                throw new Error("alerdy logout");
            }
            req.userId = data.id;
            req.token = token;
            req.decoded = data;
            next();
        default:
            break;
    }
};
exports.auth = auth;
