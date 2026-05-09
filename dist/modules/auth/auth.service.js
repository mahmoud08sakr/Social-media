"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_exception_1 = require("../../common/exceptions/application.exception");
const user_model_1 = __importDefault(require("../../database/model/user.model"));
const base_repositary_1 = require("../../database/reposatory/base.repositary");
const security_1 = require("../../common/utils/security");
const securety_service_1 = require("../../common/services/securety.service");
const sendEmail_1 = require("../../common/utils/email/sendEmail");
const redis_service_1 = require("../../common/services/redis.service");
const enums_1 = require("../../common/enums");
const token_service_1 = require("../../common/services/token.service");
const google_auth_library_1 = require("google-auth-library");
class AuthService {
    userModel;
    userRepository;
    securetyService;
    redisService;
    tokenService;
    constructor() {
        this.userModel = user_model_1.default;
        this.userRepository = new base_repositary_1.DatabaseRepository(this.userModel);
        this.securetyService = new securety_service_1.SecurityService;
        this.redisService = redis_service_1.redisService;
        this.tokenService = new token_service_1.TokenService;
    }
    async login(data) {
        let { email, password } = data;
        let exsistUser = await this.userRepository.findOne({ email, provider: enums_1.ProviderEnum.System });
        if (exsistUser) {
            const isMatched = await (0, security_1.compareHash)({ planText: password, cypherText: exsistUser.password });
            if (isMatched) {
                let { accessToken, refreshToken } = this.tokenService.genetareToken(exsistUser);
                return { exsistUser, accessToken, refreshToken };
            }
            else {
                throw new application_exception_1.BadRequestException("password not matched");
            }
        }
        return new application_exception_1.NotFoundException("User Not Found");
    }
    async signup(data) {
        data.password = await this.securetyService.generateHash({ planText: data.password });
        let result = await this.userRepository.create(data);
        if (!result) {
            throw new application_exception_1.BadRequestException('User not created');
        }
        let code = Math.floor(Math.random() * 100000);
        let hashOtp = await this.securetyService.generateHash({ planText: String(code) });
        await this.redisService.set({ key: `otp::${result._id}`, value: hashOtp });
        await (0, sendEmail_1.sendEmail)({
            to: data.email,
            subject: 'signup',
            html: `<h1>hello ${data.userName} your code is ${code}</h1>`
        });
        return result;
    }
    async verifyEmail({ code, email }) {
        let user = await this.userRepository.findOne({ email });
        if (user?.confirmEmail) {
            return {
                message: "tany ?"
            };
        }
        if (!user) {
            throw new application_exception_1.NotFoundException(" user not found");
        }
        let redisCode = await this.redisService.get(`otp::${user._id}`);
        if (!redisCode) {
            throw new application_exception_1.BadRequestException("code not found or expired");
        }
        if (await this.securetyService.compareHash({ planText: code, cypherText: redisCode })) {
            user = await this.userRepository.findOneAndUpdate({ _id: user._id }, { confirmEmail: true }, { new: true });
            if (!user) {
                throw new application_exception_1.NotFoundException(" user not found");
            }
            this.redisService.redis_delete(`otp::${user._id}`);
        }
        else {
            throw new application_exception_1.BadRequestException("code not matched ");
        }
        return user;
    }
    async signupMail(token) {
        console.log(token);
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: token.idToken,
            audience: "12909487230-8po2bsrb5hg1p4ucar23jjsc8qie6ob9.apps.googleusercontent.com"
        });
        const payload = ticket.getPayload();
        console.log(payload);
        if (!payload || !payload.email) {
            throw new application_exception_1.BadRequestException("something went wrong");
        }
        if (!payload.email_verified) {
            throw new application_exception_1.BadRequestException("email not verified");
        }
        let exsistUser = await this.userRepository.findOne({ email: payload.email });
        if (exsistUser) {
            throw new application_exception_1.ConflictException("user already exsist");
        }
        else {
            let addedUser = await this.userRepository.create({
                userName: payload.name,
                email: payload.email,
                provider: enums_1.ProviderEnum.Google
            });
            if (addedUser) {
                return addedUser;
            }
            else {
                throw new application_exception_1.BadRequestException("something went wrong");
            }
        }
    }
}
exports.default = new AuthService;
