"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const success_responce_1 = require("../../common/exceptions/success.responce");
const auth_validation_1 = require("./auth.validation");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    const data = await auth_service_1.default.login(req.body);
    (0, success_responce_1.SuccessResponce)({ res, message: 'login', status: 201, data });
});
router.post('/signup', (0, validation_middleware_1.validation)(auth_validation_1.signupSchema), async (req, res) => {
    const data = await auth_service_1.default.signup(req.body);
    res.json({ message: 'signup', data });
});
router.put('/verify-email', async (req, res) => {
    const data = await auth_service_1.default.verifyEmail(req.body);
    (0, success_responce_1.SuccessResponce)({ res, message: 'verify-email', status: 201, data });
});
router.get('/test', auth_middleware_1.auth, async (req, res) => {
    // const data = await authService.signup(req.body)
    res.json({ message: 'test' });
});
router.post('/signup/gmail', async (req, res) => {
    console.log(req.body);
    const data = await auth_service_1.default.signupMail(req.body);
    return (0, success_responce_1.SuccessResponce)({ res, message: "user signup succesfully", status: 200 });
});
exports.default = router;
