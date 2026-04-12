"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = {
    body: zod_1.z.strictObject({
        userName: zod_1.z.string({ error: "name not finddddddddddddddddddddddd" }).min(2, { error: "the min lenght is 2 " }).max(20),
        email: zod_1.z.email({ error: "email not found" }),
        password: zod_1.z.string().min(6).max(20),
        phone: zod_1.z.string().min(12).max(50),
        confirmPassword: zod_1.z.string().min(6).max(20)
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({ code: "custom", message: "password not match" });
        }
    }),
};
