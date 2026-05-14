import { HydratedDocument, ObjectId, Types } from "mongoose";
import { IPost, IUser } from "../../common/interfaces";
import postModel from "../../database/model/post.model";
import { DatabaseRepository } from "../../database/reposatory/base.repositary";
import { BadRequestException, NotFoundException } from "../../common/exceptions/application.exception";
import { S3Service, s3Service } from "../../common/services/s3.service";
import { MulterEnum } from "../../common/enums/multer.enums";
import { Request } from "express";
import userModel from "../../database/model/user.model";
import { RoleEnum, VisabilityEnum } from "../../common/enums";
import { ParsedQs } from "qs";

export class PostService {
    private postReposatory: DatabaseRepository<IPost>
    private userReposatory: DatabaseRepository<IUser>
    private s3: S3Service
    constructor() {
        this.postReposatory = new DatabaseRepository<IPost>(postModel)
        this.userReposatory = new DatabaseRepository<IUser>(userModel)
        this.s3 = s3Service
    }


    async createPost(req: Request) {

        // if(!req.body && !req.files?.length){
        //     throw new BadRequestException("attachments or content must be provided")
        // }

        let { tags }: {tags: string[] | undefined} = req.body
            req.body.userId = req.userId

        tags = Array.from(new Set(tags))

        if (tags && tags.length) {

            let result = await Promise.all(tags.map((id) => {
                return this.userReposatory.findById(id).select("")
            }))

            if (result.length != tags.length) {
                throw new NotFoundException("not all ids valid user ids ")
            }

            req.body.tags = tags
        }

        
        if (req.files && req.files.length) {
            let { result } = await this.s3.uploadAssets({
                storageKey: MulterEnum.diskStorage,
                path: `post/${req.userId}`,
                files: req.files as Express.Multer.File[]
            })
            req.body.attachments = result
        }

        return await this.postReposatory.create(req.body)

    }


    async getPosts(userId:string , query:any ){
        let {page = 1 , limit = 2 , search }:{
            page : any,
            limit : any,
            search : any
        } = query

        page = Number(page)
        limit = Number(limit)

        if(page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must bre positive");
        }

        let skip = (page - 1 ) * limit



        let user = await this.userReposatory.findById(userId).select("frindes role")
        if(!user) throw new NotFoundException("login user not found")
        let filter : any = search ? {content : {$regex : search , $options : "i" } , admin:true} : {admin:true}
        if(user && user.role !== RoleEnum.Admin){
            filter = {
            ...filter ,
            admin: false ,   
            $or:[
                {visability : VisabilityEnum.Public},
                {userId :{$in:[ ...[userId , ...user?.frindes as unknown as string[]]]} , visability : VisabilityEnum.Friends},
                {userId },
                {tags : userId  }
            ]
        }
        }



        let posts = await this.postReposatory.find(filter).sort("-createdAt").skip(skip).limit(limit)

        let postsCount = await postModel.countDocuments(filter)

        return {
            currentPage : page,
            pages : Math.ceil(postsCount / limit),
            docsCount: postsCount,
            posts
        }
    }


}





// update cover pics array 

export const postService = new PostService()