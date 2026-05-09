"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_service_1 = require("../../config/env.service");
const application_exception_1 = require("../exceptions/application.exception");
class TokenService {
    constructor() {
    }
    genetareToken(user) {
        let signature = undefined;
        let audience = undefined;
        let refreshSignature = undefined;
        switch (user.role) {
            case "0":
                signature = env_service_1.env.adminSignature;
                refreshSignature = env_service_1.env.adminRefreshSignature;
                audience = "Admin";
                break;
            default:
                signature = env_service_1.env.userSignature;
                refreshSignature = env_service_1.env.userRefreshSignature;
                audience = "User";
                break;
        }
        let accessToken = jsonwebtoken_1.default.sign({ id: user._id }, signature, {
            audience,
            expiresIn: "30m"
        });
        let refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, refreshSignature, {
            expiresIn: "1y",
            audience
        });
        return { accessToken, refreshToken };
    }
    decodeToken(token) {
        let decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded) {
            throw new application_exception_1.BadRequestException("invalid token");
        }
        let signature = undefined;
        switch (decoded.aud) {
            case "Admin":
                signature = env_service_1.env.adminSignature;
                break;
            default:
                signature = env_service_1.env.userSignature;
                break;
        }
        let decodedData = jsonwebtoken_1.default.verify(token, signature);
        return decodedData;
    }
    decodeRefreshToken(refreshToken) {
        let decoded = jsonwebtoken_1.default.decode(refreshToken);
        if (!decoded) {
            throw new application_exception_1.BadRequestException("invalid token");
        }
        let refreshSignature = undefined;
        switch (decoded.aud) {
            case "Admin":
                refreshSignature = env_service_1.env.adminRefreshSignature;
                break;
            default:
                refreshSignature = env_service_1.env.userRefreshSignature;
                break;
        }
        let decodedData = jsonwebtoken_1.default.verify(refreshToken, refreshSignature);
        return decodedData;
    }
}
exports.TokenService = TokenService;
