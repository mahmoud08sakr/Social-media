import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import userModel from "../../database/model/user.model";
import { DatabaseRepository } from "../../database/reposatory/base.repositary";
import { BadRequestException, NotFoundException } from "../../common/exceptions/application.exception";
import { s3Service } from "../../common/services/s3.service";
import { MulterEnum } from "../../common/enums/multer.enums";

export class UserService {
    private userReposatory: DatabaseRepository<IUser>
    constructor() {
        this.userReposatory = new DatabaseRepository<IUser>(userModel)
    }


    async getUserProfile(userId: string): Promise<HydratedDocument<IUser>> {
        let userData = await this.userReposatory.findById(userId).select("-password")
        if (!userData) {
            throw new NotFoundException("User not found")
        }
        return userData
    }

    async updateProfile(userId: string, file: Express.Multer.File, data: any): Promise<{ userData: HydratedDocument<IUser>, url: string }> {
        let userData = await this.userReposatory.findById(userId).select("-password")
        if (!userData) {
            throw new NotFoundException("User not found")
        }
        if (userData.profilePic) {
            await s3Service.deleteAsset({
                Key: userData.profilePic
            })
        }
        let { url, key } = await s3Service.createPreSIgnUrl({
            path: `${userData._id}/profile-pic`,
        })
        userData.profilePic = key as string
        await userData.save()
        return { userData, url }
    }
    async updateCoverPic(userId: string, files: Express.Multer.File[]) {
        let userData = await this.userReposatory.findById(userId).select("-password")
        if (!userData) {
            throw new NotFoundException("User not found")
        }
        if (files.length > 0) {
            let { Key, result } = await s3Service.uploadAssets({
                path: `${userData._id}/cover-pic`,
                files,
            })
            console.log(result);
            userData.profileCoverPic = result as string[]
        }
        await userData.save()
        return userData
    }
}





// update cover pics array 

export const userService = new UserService()