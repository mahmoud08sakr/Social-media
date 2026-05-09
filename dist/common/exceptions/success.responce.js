"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponce = void 0;
const SuccessResponce = ({ res, message = 'success', status = 200, data }) => {
    return res.status(status).json({
        message, data
    });
};
exports.SuccessResponce = SuccessResponce;
