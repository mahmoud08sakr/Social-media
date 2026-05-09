import { Request, Response, Router } from "express";
import { userService } from "./user.service";
import { auth } from "../../middleware/auth.middleware";
import { SuccessResponce } from "../../common/exceptions/success.responce";
import { uploadFile } from "../../common/utils/multer/cloud";
import { MulterEnum } from "../../common/enums/multer.enums";


const router = Router()


router.get('/get-user-profile', auth, async (req: Request, res: Response) => {
    let userData = await userService.getUserProfile(req.userId as string)
    SuccessResponce({ res, message: "User profile data", data: userData })
})


router.patch('/update-profile', auth, uploadFile({ storageKey: MulterEnum.diskStorage }).single("file"), async (req: Request, res: Response) => {
    let userData = await userService.updateProfile(req.userId as string, req.file as Express.Multer.File , req.body)
    SuccessResponce({ res, message: "User profile data", data: userData })
})


router.patch('/update-cover-pic', auth, uploadFile({ storageKey: MulterEnum.diskStorage }).array("files"), async (req: Request, res: Response) => {
    let userData = await userService.updateCoverPic(req.userId as string, req.files as Express.Multer.File[])
    SuccessResponce({ res, message: "User profile data", data: userData })
})


export default router