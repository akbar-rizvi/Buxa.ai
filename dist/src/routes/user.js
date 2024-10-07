"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = __importDefault(require("../controllers"));
const middleware_1 = require("../middleware");
const validators_1 = __importDefault(require("../validators"));
const router = (0, express_1.Router)();
// Define routes for user-related endpoints
router.post("/register", (0, middleware_1.validateRequest)(validators_1.default.auth.registerUserSchema), controllers_1.default.user.registerUser);
router.post("/login", (0, middleware_1.validateRequest)(validators_1.default.auth.loginUserSchema), controllers_1.default.user.loginUser);
router.post("/logout", (0, middleware_1.validateRequest)(validators_1.default.auth.logoutUserSchema), controllers_1.default.user.logoutUser);
exports.default = router;
//# sourceMappingURL=user.js.map