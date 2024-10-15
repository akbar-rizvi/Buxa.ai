import express from "express"
import { validateRequest } from "../middleware";
import validators from "../validators";
import controller  from "../controllers";

const router=express.Router()

// router.post("/register", validateRequest(validators.auth.registerUserSchema),controller.user.registerUser);
// router.post("/login", validateRequest(validators.auth.loginUserSchema),controller.user.loginUser);
router.post("/logout",validateRequest(validators.auth.logoutUserSchema),controller.user.logoutUser)
router.get('/google-login',controller.user.googleLogIn);

export default router