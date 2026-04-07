import { ApplicationException } from "../../common/exceptions/application.exception";
import { LoginDTO, SignupDTO } from "./auth.dto";


class AuthService {
    constructor() {

    }

    login(data: any): any {
        // console.log(fcghjk);
        
        // throw new ApplicationException('Method not implemented.', 400);
        return data
    }

    signup(data: SignupDTO): SignupDTO {
        return data
    }
}

export default new AuthService