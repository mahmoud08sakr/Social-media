import { type Request, type Response, Router } from "express";
import authService from "./auth.service";
import { SuccessResponce } from "../../common/exceptions/success.responce";
import { signupSchema } from "./auth.validation";
import { BadRequestException } from "../../common/exceptions/application.exception";
import { validation } from "../../middleware/validation.middleware";

const router = Router();


router.post('/login', async (req: Request, res: Response) => {
    const data = await authService.login(req.body)
    SuccessResponce({ res, message: 'login', status: 201, data })
})

router.post('/signup', validation(signupSchema), async (req: Request, res: Response) => {
    const data = await authService.signup(req.body)
    res.json({ message: 'signup', data })
})


router.put('/verify-email', async (req: Request, res: Response) => {
    const data = await authService.verifyEmail(req.body)
    SuccessResponce({ res, message: 'verify-email', status: 201, data })

})


export default router