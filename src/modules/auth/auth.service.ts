import { HydratedDocument, Model } from "mongoose";
import { ApplicationException, BadRequestException } from "../../common/exceptions/application.exception";
import { LoginDTO, SignupDTO } from "./auth.dto";
import { IUser } from "../../common/interfaces";
import userModel from '../../database/model/user.model'
import { DatabaseRepository } from "../../database/reposatory/base.repositary";


class AuthService {
    private userModel: Model<IUser>
    private userRepository: DatabaseRepository<IUser>
    constructor() {
        this.userModel = userModel
        this.userRepository = new DatabaseRepository(this.userModel)
    }

    async login(data: LoginDTO): Promise<HydratedDocument<IUser> | null> {
        let result = await this.userRepository.findOne({ email: data.email, password: data.password }, {password: 0  , email: 0 , firstName:0})
        return result
    }
    async signup(data: SignupDTO): Promise<IUser> {
        let result: HydratedDocument<IUser> = await this.userRepository.create(data)
        if (!result) {
            throw new BadRequestException('User not created')
        }
        return result
    }
}

export default new AuthService