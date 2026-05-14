import jwt, { JwtPayload } from 'jsonwebtoken'
import { env } from '../../config/env.service'
import { BadRequestException } from '../exceptions/application.exception'

export class TokenService {
    constructor() {

    }

    genetareToken(user: any): { accessToken: string, refreshToken: string } {
        let signature = undefined
        let audience = undefined
        let refreshSignature = undefined
        switch (user.role) {
            case "0":
                signature = env.adminSignature
                refreshSignature = env.adminRefreshSignature
                audience = "Admin"
                break;
            default:
                signature = env.userSignature
                refreshSignature = env.userRefreshSignature
                audience = "User"
                break;
        }
        let accessToken = jwt.sign({ id: user._id }, signature, {
            audience,
            expiresIn: "30y"
        })
        let refreshToken = jwt.sign({ id: user._id }, refreshSignature, {
            expiresIn: "1y",
            audience
        })
        return { accessToken, refreshToken }
    }


    decodeToken(token: string): string | jwt.JwtPayload {
        let decoded = jwt.decode(token) as JwtPayload
        if (!decoded) {
            throw new BadRequestException("invalid token")
        }
        let signature = undefined
        switch (decoded.aud) {
            case "Admin":
                signature = env.adminSignature
                break;
            default:
                signature = env.userSignature
                break;
        }
        let decodedData = jwt.verify(token, signature)
        return decodedData
    }


    decodeRefreshToken(refreshToken: string): JwtPayload | string {
        let decoded = jwt.decode(refreshToken) as JwtPayload
        if (!decoded) {
            throw new BadRequestException("invalid token")
        }
        let refreshSignature = undefined
        switch (decoded.aud) {
            case "Admin":
                refreshSignature = env.adminRefreshSignature
                break;
            default:
                refreshSignature = env.userRefreshSignature
                break;
        }
        let decodedData = jwt.verify(refreshToken, refreshSignature)
        return decodedData
    }

}