"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const application_exception_1 = require("../common/exceptions/application.exception");
const validation = (schema) => {
    return ((req, res, next) => {
        console.log(Object.keys(schema));
        let validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key]) {
                continue;
            }
            const value = schema[key].safeParse(req[key]);
            if (!value.success) {
                validationError.push({ key, issue: value.error.issues });
            }
        }
        if (validationError.length > 0) {
            throw new application_exception_1.BadRequestException('Validation error', validationError);
        }
        next();
    });
};
exports.validation = validation;
