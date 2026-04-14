import { HydratedDocument, Model } from "mongoose";
import { ApplicationException, BadRequestException, NotFoundException } from "../../common/exceptions/application.exception";
import { LoginDTO, SignupDTO } from "./auth.dto";
import { IUser } from "../../common/interfaces";
import userModel from '../../database/model/user.model'
import { DatabaseRepository } from "../../database/reposatory/base.repositary";
import { compareHash, generateHash } from "../../common/utils/security";
import { SecurityService } from "../../common/services/securety.service";
import { sendEmail } from "../../common/utils/email/sendEmail";
import { redisService, RedisService } from "../../common/services/redis.service";


class AuthService {
    private userModel: Model<IUser>
    private userRepository: DatabaseRepository<IUser>
    private securetyService: SecurityService
    private redisService: RedisService
    constructor() {
        this.userModel = userModel
        this.userRepository = new DatabaseRepository(this.userModel)
        this.securetyService = new SecurityService
        this.redisService = redisService
    }

    async login(data: LoginDTO): Promise<HydratedDocument<IUser> | null> {
        let result = await this.userRepository.findOne({ email: data.email }, { email: 0, firstName: 0 })
        if (!result) {
            throw new NotFoundException("user not found")
        }

        let matchedPassword = await this.securetyService.compareHash({ planText: data.password, cypherText: result.password })
        if (!matchedPassword) {
            throw new BadRequestException("password not matched")
        }
        return result
    }
    async signup(data: SignupDTO): Promise<IUser> {
        data.password = await this.securetyService.generateHash({ planText: data.password })
        let result: HydratedDocument<IUser> = await this.userRepository.create(data)
        if (!result) {
            throw new BadRequestException('User not created')
        }
        let code = Math.floor(Math.random() * 100000)
        let hashOtp = await this.securetyService.generateHash({ planText: String(code) })
        await this.redisService.set({ key: `otp::${result._id}`, value: hashOtp })
        await sendEmail({
            to: data.email,
            subject: 'signup',
            html: `<h1>hello ${data.userName} your code is ${code}</h1>`
        })
        return result
    }

    async verifyEmail({ code, email }: {
        code: string,
        email: string
    }) {
        let user = await this.userRepository.findOne({ email })
        if (user?.confirmEmail) {
            return {
                message: "tany ?"
            }
        }
        if (!user) {
            throw new NotFoundException(" user not found")
        }

        let redisCode = await this.redisService.get(`otp::${user._id}`)
        if (!redisCode) {
            throw new BadRequestException("code not found or expired")
        }

        if (await this.securetyService.compareHash({ planText: code, cypherText: redisCode })) {
            user = await this.userRepository.findOneAndUpdate({ _id: user._id }, { confirmEmail: true }, { new: true })
            if (!user) {
                throw new NotFoundException(" user not found")
            }
            this.redisService.redis_delete(`otp::${user._id}`)
        } else {
            throw new BadRequestException("code not matched ")
        }
        return user
    }
}

export default new AuthService