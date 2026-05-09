"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)({ path: path_1.default.resolve(`./.env.${process.env.NODE_ENV}`) });
const mongoURL = process.env.MONGO_URI;
const mongoURL_PROD = process.env.MONGO_URI_PROD;
const mood = process.env.MOOD;
const port = process.env.PORT;
const salt = process.env.SALT;
const jwt_key = process.env.JWT_KEY;
const userSignature = process.env.JWT_USER_SIGNATURE;
const adminSignature = process.env.JWT_ADMIN_SIGNATUER;
const userRefreshSignature = process.env.JWT_USER_REFRESH_SIGNATURE;
const adminRefreshSignature = process.env.JWT_ADMIN_REFRESH_SIGNATURE;
const BASE_URL = process.env.BASE_URL;
const REDIS_URI = process.env.REDIS_URI;
const APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD;
const APP_EMAIL = process.env.EMAIL;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_EXPIRATION_TIME = process.env.AWS_EXPIRATION_TIME;
exports.env = {
    port,
    mongoURL,
    mood, salt,
    jwt_key, userSignature,
    adminSignature,
    userRefreshSignature,
    adminRefreshSignature,
    BASE_URL,
    REDIS_URI,
    APP_PASSWORD,
    APP_EMAIL,
    mongoURL_PROD,
    AWS_BUCKET_NAME,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_EXPIRATION_TIME
};
