import { z } from "zod"




export const signupSchema = {
    body: z.strictObject({
        name: z.string({ error: "name not finddddddddddddddddddddddd" }).min(2, { error: "the min lenght is 2 " }).max(20),
        email: z.email({ error: "email not found" }),
        password: z.string().min(6).max(20),
        confirmPassword: z.string().min(6).max(20)
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({ code: "custom", message: "password not match" })
        }

    }),


}