"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const env_service_1 = require("../../../config/env.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateHash = async ({ planText, salt = env_service_1.env.salt }) => {
    return await bcrypt_1.default.hash(planText, Number(salt));
};
exports.generateHash = generateHash;
const compareHash = async ({ planText, cypherText }) => {
    return await bcrypt_1.default.compare(planText, cypherText);
};
exports.compareHash = compareHash;
