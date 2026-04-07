import {z} from "zod"
import { signupSchema } from "./auth.validation"



export interface LoginDTO {
    email: string,
    password: string
}


// export interface SignupDTO extends LoginDTO {
//     name: string
// }

export type SignupDTO  = z.infer<typeof signupSchema.body>