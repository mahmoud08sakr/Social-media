"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_exception_1 = require("../../common/exceptions/application.exception");
const user_model_1 = __importDefault(require("../../database/model/user.model"));
const base_repositary_1 = require("../../database/reposatory/base.repositary");
class AuthService {
    userModel;
    userRepository;
    constructor() {
        this.userModel = user_model_1.default;
        this.userRepository = new base_repositary_1.DatabaseRepository(this.userModel);
    }
    async login(data) {
        let result = await this.userRepository.findOne({ email: data.email, password: data.password }, { password: 0, email: 0, firstName: 0 });
        return result;
    }
    async signup(data) {
        let result = await this.userRepository.create(data);
        if (!result) {
            throw new application_exception_1.BadRequestException('User not created');
        }
        return result;
    }
}
exports.default = new AuthService;
