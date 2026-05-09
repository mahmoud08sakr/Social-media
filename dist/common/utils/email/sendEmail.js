"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_service_1 = require("../../../config/env.service");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: env_service_1.env.APP_EMAIL,
        pass: env_service_1.env.APP_PASSWORD,
    },
});
let sendEmail = async ({ to, subject, html }) => {
    const info = await transporter.sendMail({
        from: `"mahmoud sakr" <${env_service_1.env.APP_EMAIL}>`,
        to,
        subject,
        html,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
