import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { postService } from "./post.service";
import { auth } from "../../middleware/auth.middleware";
import { SuccessResponce } from "../../common/exceptions/success.responce";
import { uploadFile } from "../../common/utils/multer/cloud";
import { MulterEnum } from "../../common/enums/multer.enums";
import { validation } from "../../middleware";
import { createPostSchema } from "./post.validation";
import { success } from "zod";


const router = Router()


router.post("/",
    auth,
    uploadFile({storageKey : MulterEnum.diskStorage}).array("attachments" , 4),
    validation(createPostSchema),
    async (req : Request,res : Response,next :NextFunction)   =>{
    let data = await postService.createPost(req)
    SuccessResponce({
        res ,
        message : "post created",
        status : 201 ,
        data
    })
})

router.get("/" ,auth ,async(req,res,next) =>{
    let data = await postService.getPosts(req.userId as string , req.query)
    SuccessResponce({
        res,
        message : "done",
        status : 200,
        data
    })
})


export default router