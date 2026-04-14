"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_exception_1 = require("../../common/exceptions/application.exception");
const user_model_1 = __importDefault(require("../../database/model/user.model"));
const base_repositary_1 = require("../../database/reposatory/base.repositary");
const securety_service_1 = require("../../common/services/securety.service");
const sendEmail_1 = require("../../common/utils/email/sendEmail");
const redis_service_1 = require("../../common/services/redis.service");
class AuthService {
    userModel;
    userRepository;
    securetyService;
    redisService;
    constructor() {
        this.userModel = user_model_1.default;
        this.userRepository = new base_repositary_1.DatabaseRepository(this.userModel);
        this.securetyService = new securety_service_1.SecurityService;
        this.redisService = redis_service_1.redisService;
    }
    async login(data) {
        let result = await this.userRepository.findOne({ email: data.email }, { email: 0, firstName: 0 });
        if (!result) {
            throw new application_exception_1.NotFoundException("user not found");
        }
        let matchedPassword = await this.securetyService.compareHash({ planText: data.password, cypherText: result.password });
        if (!matchedPassword) {
            throw new application_exception_1.BadRequestException("password not matched");
        }
        return result;
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
}
exports.default = new AuthService;
