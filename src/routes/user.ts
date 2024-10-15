import { Router } from "express";
import controller from "../controllers";
import {validateRequest} from '../middleware';
import validators from "../validators";
import { verifyAccessToken } from "../config/jwt";

const router = Router();


// router.put("/",controller.user.updateUser)
router.get("/update" , controller.PaymentController.sucees)
router.post("/payment",controller.PaymentController.createPayment)
router.post("/razorpay/webhook",controller.PaymentController.checkRazorPayPaymentStatus)
router.post('/cashfree', verifyAccessToken,controller.PaymentController.createOrderCashfree);
router.get('/status/:orderId', controller.PaymentController.checkStatus)
// router.get("/google-login",controller.user.googleLogIn)

export default router;
