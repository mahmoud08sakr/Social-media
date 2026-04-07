import { type Request, type Response, Router } from "express";
import authService from "./auth.service";
import { SuccessResponce } from "../../common/exceptions/success.responce";
import { signupSchema } from "./auth.validation";
import { BadRequestException } from "../../common/exceptions/application.exception";
import { validation } from "../../middleware/validation.middleware";

const router = Router();


router.post('/login', (req: Request, res: Response) => {
    const data = authService.login(req.body)
    console.log(data);
    SuccessResponce({ res, message: 'login', status: 201, data })
})

router.post('/signup',validation(signupSchema), (req: Request, res: Response) => {
    const data = authService.signup(req.body)
    res.json({ message: 'signup', data })
})




export default router