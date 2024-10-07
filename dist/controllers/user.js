"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const dbServices_1 = __importDefault(require("../services/dbServices"));
class user {
}
_a = user;
// Controller for handling user registration
user.registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    try {
        // Call the service to register a new user
        const newUser = yield dbServices_1.default.user.registerUser({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
        });
        // Generate access token and refresh token using secrets from envConf
        const accessToken = newUser.generateAccessToken(); // Use the method from the User model
        const refreshToken = newUser.generateRefreshToken(); // Use the method from the User model
        // Save the refresh token to the newUser document in the database
        newUser.refreshToken = refreshToken;
        yield newUser.save();
        // Return a success response
        res.status(200).json({ status: true,
            message: "User registered successfully",
            accessToken,
            refreshToken,
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
        });
    }
    catch (error) {
        res.status(500).json({ status: false, message: error.message }); // Conflict status
    }
});
// Controller for handling user login
user.loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = yield dbServices_1.default.user.loginUser(email, password);
        // Return the tokens and user details in the response
        res.status(200).json({ status: true, message: "user Logged In", data: user });
    }
    catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});
// Controller for handling user logout
user.logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }
    try {
        // Find the user associated with the given refresh token
        const user = yield user_model_1.User.findOne({ refreshToken });
        if (!user) {
            res.status(404).json({ message: "User not found or already logged out" });
            return;
        }
        user.refreshToken = "";
        yield user.save();
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error during logout" });
    }
});
exports.default = user;
