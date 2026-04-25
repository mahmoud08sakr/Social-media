import { HydratedDocument, Model } from "mongoose";
import { ApplicationException, BadRequestException, ConflictException, NotFoundException } from "../../common/exceptions/application.exception";
import { LoginDTO, SignupDTO } from "./auth.dto";
import { IUser } from "../../common/interfaces";
import userModel from '../../database/model/user.model'
import { DatabaseRepository } from "../../database/reposatory/base.repositary";
import { compareHash, generateHash } from "../../common/utils/security";
import { SecurityService } from "../../common/services/securety.service";
import { sendEmail } from "../../common/utils/email/sendEmail";
import { redisService, RedisService } from "../../common/services/redis.service";
import { ProviderEnum } from "../../common/enums";
import { TokenService } from "../../common/services/token.service";
import { OAuth2Client } from 'google-auth-library'


class AuthService {
    private userModel: Model<IUser>
    private userRepository: DatabaseRepository<IUser>
    private securetyService: SecurityService
    private redisService: RedisService
    private tokenService: TokenService
    constructor() {
        this.userModel = userModel
        this.userRepository = new DatabaseRepository(this.userModel)
        this.securetyService = new SecurityService
        this.redisService = redisService
        this.tokenService = new TokenService
    }

    async login(data: LoginDTO) {
        let { email, password } = data
        let exsistUser = await this.userRepository.findOne({ email, provider: ProviderEnum.System })
        if (exsistUser) {
            const isMatched = await compareHash({ planText: password, cypherText: exsistUser.password })
            if (isMatched) {
                let { accessToken, refreshToken } = this.tokenService.genetareToken(exsistUser)
                return { exsistUser, accessToken, refreshToken }
            } else {
                throw new BadRequestException("password not matched")
            }
        }
        return new NotFoundException("User Not Found")
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

    async signupMail(token: {idToken: string}) {
        console.log(token);

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: token.idToken,
            audience: "12909487230-8po2bsrb5hg1p4ucar23jjsc8qie6ob9.apps.googleusercontent.com"
        });
        const payload = ticket.getPayload();

        console.log(payload);
        
        if (!payload || !payload.email) {
            throw new BadRequestException("something went wrong")
        }
        if (!payload.email_verified) {
            throw new BadRequestException("email not verified")
        }
        let exsistUser = await this.userRepository.findOne({ email: payload.email })
        if (exsistUser) {
            throw new ConflictException("user already exsist")
        } else {
            let addedUser = await this.userRepository.create(
                {
                    userName: payload.name!,
                    email: payload.email!,
                    provider: ProviderEnum.Google!
                }
            )
            if (addedUser) {
                return addedUser
            } else {
                throw new BadRequestException("something went wrong")
            }
        }
    }

}

export default new AuthService