"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const multer_1 = __importDefault(require("multer"));
const os_1 = require("os");
const multer_enums_1 = require("../../enums/multer.enums");
const uploadFile = ({ storageKey = multer_enums_1.MulterEnum.memoryStorage }) => {
    const storage = storageKey == multer_enums_1.MulterEnum.memoryStorage ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, (0, os_1.tmpdir)());
        },
        filename(req, file, callback) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
            callback(null, `${file.fieldname}-${uniqueSuffix}`);
        },
    });
    return (0, multer_1.default)({ storage });
};
exports.uploadFile = uploadFile;
