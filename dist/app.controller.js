"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const bootstrap = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.use('/auth', modules_1.authRouter);
    app.use(middleware_1.globalErrorHandler);
    app.listen(3000, () => {
        console.log('server is running on port 3000');
    });
};
exports.bootstrap = bootstrap;
