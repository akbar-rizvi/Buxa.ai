import { razorpay } from "../helper/razorpay"
import {Request,Response} from "express"
import dbServices from "../services/dbServices"
import crypto from "crypto";
import uniqid from "uniqid";
import axios from "axios";
import { AuthenticatedRequest } from "./document";

export default class PaymentController{

  static createPayment=async(req:Request,res:Response)=>{
    try {
        const userId=req["user"]
        // const userId="66fb951822f626ed85d3db2c"
        const amount=req.body.amount
        const credits={
            1:1,
            49:49,
            100:120,
            149:200
          }
        const options={
            amount:amount,
            credits:credits[amount],
            currency:"INR"
        }
        console.log(options,"options")
        const response = await razorpay.orders.create(options)
        console.log("response",response)
        if(!response){
            throw new Error("Payment failed")
        }
        const data={
            userId:userId,
            amount:amount,
            orderId:response.id,
            credits:options.credits,
            paymentMethod:"razorpay",
        }
        console.log("hello")
        await dbServices.Payment.createPayment(data)
        res.status(200).send({status:true, message: "Payment Created" ,data:response.id});
    } catch (error) {
      console.log(error.message)
        res.status(500).send({ status:false,error: error.message }); 
    }
}

static checkRazorPayPaymentStatus = async(req:Request,res:Response):Promise<any>=>{
    try {
      const webhookSignature = req.headers["x-razorpay-signature"] as string;
      const secret = process.env.webhookSecret;
      const validate = this.verifyWebhookSignature(JSON.stringify(req.body), webhookSignature, secret);
      if(!validate) throw new Error("Invalid Signature");
      
      const { event, payload } = req.body;
            
      if (event === 'payment.authorized') {
        const orderId = payload.payment.entity.order_id;
        if(!orderId) throw new Error("Order Id not found");
        await dbServices.Payment.confirmOrderStatus(orderId,"success");
      } else if (event === 'payment.failed') {
        const orderId = payload.payment.entity.order_id;
        if(!orderId) throw new Error("Order Id not found");
        await dbServices.Payment.updateOrderStatus(orderId,"failed");
      }
      res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500); 
    }
  }

  static verifyWebhookSignature = (webhookBody:string, webhookSignature:string, secret:string) => {

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(webhookBody).digest('hex');
    return expectedSignature === webhookSignature;
  }


  static createOrderCashfree = async (req:AuthenticatedRequest, res:Response) => {
    try{
      const userId:any=req.user ;
      // console.log(userId)
    // const userId="6707b77ef4452701c744f078"
    if(!userId) throw new Error("error in getting user from userId")
    const { amount, customerPhone } = req.body;
    const orderId = uniqid();
    const amountToCredits = {
      1:1,
      49: 40,
      100: 100,
      149: 200
    };
    const credits = amountToCredits[amount] ;  
    if (credits === undefined) throw new Error("Invalid amount");
    // const getUserDetails=await dbServices.Payment.getUserDetails(userId)
    // if(getUserDetails.length<=0)  throw new Error("User Not found")
    const createPayment = await dbServices.Payment.createCashfreeOrder(parseInt(amount),"INR",orderId ,userId,customerPhone)
    if(!createPayment)throw new Error("Error in creating order")
      const details={
        orderId:createPayment?.order_id ,
        userId:userId,
        credits:credits,
        amount:amount,
        method:"cashfree",
      }
      await dbServices.Payment.createPayment(details)
      res.status(200).send({status:true,message:"Payment Details Inserted",data:{orderId:createPayment?.order_id, sessionId:createPayment?.payment_session_id}})
    } catch (error) {
      console.error('Error setting up order request:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Payment initiation failed' });
    }
  }

  static checkStatus = async (req: Request, res: Response):Promise<any> => {
    try {
      // console.log("hitttppppddsd")
      const orderId = req.params.orderId;
      const options = {
        method: 'GET',
        url: `https://sandbox.cashfree.com/pg/orders/${orderId}`,
        headers: {
          accept: 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.XClientId,
          'x-client-secret':process.env.XClientSecret,
        }
      };
  
      // Make the axios request
      const response = await axios.request(options);
  
      // Check order status and update database accordingly
      if (response.data.order_status === 'PAID') {
        await dbServices.Payment.confirmOrderStatus(orderId, "success");
        // res.status(200).json({status:true , message :"update paymentt"})
      
        const url = `https://www.wikipedia.org/`;
        return res.redirect(url);
        // res.status(200).send({status:true,message:"Payment seccess"})
      } else {
        await dbServices.Payment.updateOrderStatus(orderId, "failed");
        const url = `https://lex.live/failure`;
        return res.redirect(url);
        // res.status(500).send({status:false,message:"Payment seccess"})
      }
  
    } catch (error) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  };


  static sucees = async(req:Request ,res:Response)=>{
    try{
      // console.log("hitt")
      const orderId = "1lvc0hwkm234dkbf"
      await dbServices.Payment.confirmOrderStatus(orderId, "success");
      res.status(200).json({status:true , message :"updated"})
    }catch(error:any){
      throw new Error
    }
  }
}