


import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { BadRequestException } from '../common/exceptions/application.exception';
import { TokenService } from '../common/services/token.service';
import { redisService } from '../common/services/redis.service';

const tokenService = new TokenService


interface AuthInterface extends Request {
    userId?: string,
    token?: string,
    decoded?: JwtPayload
}

declare global {
    namespace Express {
        interface Request {
            userId?: string,
            token?: string,
            decoded?: JwtPayload
        }
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    let { authorization } = req.headers
    if (!authorization) {
        throw new BadRequestException("un authorized")
    }
    let [flag, token] = authorization.split(" ")
    if (!flag || !token) {
        throw new BadRequestException("un authorized")
    }
    switch (flag) {
        case "Basic":
            const Basicdata = Buffer.from(token, "base64").toString()
            let [email, password] = Basicdata.split(":")
            console.log(email, "  ", password);
            break;
        case "Bearer":
            if (!authorization) {
                throw new BadRequestException("un authorized")
            }
            let data = tokenService.decodeToken(token) as JwtPayload
            console.log(data);

            let revoked = await redisService.get(redisService.createRevokeKey({
                userId: data.id,
                token
            }))


            if (revoked !== null) {
                throw new Error("alerdy logout")
            }

            req.userId = data.id
            req.token = token
            req.decoded = data
            next()
        default:
            break;
    }

}
