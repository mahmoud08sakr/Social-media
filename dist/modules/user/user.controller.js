"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = require("./user.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const success_responce_1 = require("../../common/exceptions/success.responce");
const cloud_1 = require("../../common/utils/multer/cloud");
const multer_enums_1 = require("../../common/enums/multer.enums");
const router = (0, express_1.Router)();
router.get('/get-user-profile', auth_middleware_1.auth, async (req, res) => {
    let userData = await user_service_1.userService.getUserProfile(req.userId);
    (0, success_responce_1.SuccessResponce)({ res, message: "User profile data", data: userData });
});
router.patch('/update-profile', auth_middleware_1.auth, (0, cloud_1.uploadFile)({ storageKey: multer_enums_1.MulterEnum.diskStorage }).single("file"), async (req, res) => {
    let userData = await user_service_1.userService.updateProfile(req.userId, req.file, req.body);
    (0, success_responce_1.SuccessResponce)({ res, message: "User profile data", data: userData });
});
router.patch('/update-cover-pic', auth_middleware_1.auth, (0, cloud_1.uploadFile)({ storageKey: multer_enums_1.MulterEnum.diskStorage }).array("files"), async (req, res) => {
    let userData = await user_service_1.userService.updateCoverPic(req.userId, req.files);
    (0, success_responce_1.SuccessResponce)({ res, message: "User profile data", data: userData });
});
exports.default = router;
