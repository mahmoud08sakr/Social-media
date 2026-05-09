"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_model_1 = __importDefault(require("../../database/model/user.model"));
const base_repositary_1 = require("../../database/reposatory/base.repositary");
const application_exception_1 = require("../../common/exceptions/application.exception");
const s3_service_1 = require("../../common/services/s3.service");
class UserService {
    userReposatory;
    constructor() {
        this.userReposatory = new base_repositary_1.DatabaseRepository(user_model_1.default);
    }
    async getUserProfile(userId) {
        let userData = await this.userReposatory.findById(userId).select("-password");
        if (!userData) {
            throw new application_exception_1.NotFoundException("User not found");
        }
        return userData;
    }
    async updateProfile(userId, file, data) {
        let userData = await this.userReposatory.findById(userId).select("-password");
        if (!userData) {
            throw new application_exception_1.NotFoundException("User not found");
        }
        if (userData.profilePic) {
            await s3_service_1.s3Service.deleteAsset({
                Key: userData.profilePic
            });
        }
        let { url, key } = await s3_service_1.s3Service.createPreSIgnUrl({
            path: `${userData._id}/profile-pic`,
        });
        userData.profilePic = key;
        await userData.save();
        return { userData, url };
    }
    async updateCoverPic(userId, files) {
        let userData = await this.userReposatory.findById(userId).select("-password");
        if (!userData) {
            throw new application_exception_1.NotFoundException("User not found");
        }
        if (files.length > 0) {
            let { Key, result } = await s3_service_1.s3Service.uploadAssets({
                path: `${userData._id}/cover-pic`,
                files,
            });
            console.log(result);
            userData.profileCoverPic = result;
        }
        await userData.save();
        return userData;
    }
}
exports.UserService = UserService;
// update cover pics array 
exports.userService = new UserService();
