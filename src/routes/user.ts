import { Router } from "express";
import controller from "../controllers";
import {authenticateUser, validateRequest} from '../middleware';
import validators from "../validators";



const router = Router();

router.get("/google-login",validateRequest(validators.auth.googleLogin),controller.user.googleSignInSignUp)
router.get("/",authenticateUser , controller.user.userdetails )
router.get("/dashboard",authenticateUser,controller.user.dashboardData)
router.post("/checkout",authenticateUser,controller.Payment.payment) // not 
router.post('/cashfree',authenticateUser, controller.Payment.createOrderCashfree); // first 
router.get('/status/:orderId', controller.Payment.checkStatus) // second 


export default router;
