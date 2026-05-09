import { env } from "../../../config/env.service"
import bcrypt from "bcrypt"

export const generateHash = async ({ planText, salt = env.salt }: {
    planText: string,
    salt?: string
}): Promise<string> => {
    return await bcrypt.hash(planText, Number(salt))
}

export const compareHash = async ({ planText, cypherText }: {
    planText: string,
    cypherText: string
}): Promise<boolean> => {
    return await bcrypt.compare(planText, cypherText)
}