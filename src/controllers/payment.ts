import {Request,response,Response} from "express"
import crypto from "crypto"
// import { envConfigs } from "../config";
import axios from "axios";
import sha256 from 'sha256';
import uniqid from 'uniqid';
import dbServices from "../services/dbServices";
import logger from "../config/logger";

interface AuthenticatedRequest extends Request {
  user?: any;
  body:any;
  params:any
}

export class Payment {
  
  static payment = async (req:AuthenticatedRequest,res:Response)=>{
    try{
      const userId = req["user"]["userId"]
      const amount = req.body.amount
      const amountToCredits:any = {
        49: 40,
        100: 100,
        149: 200
      };
      const credits:any = amountToCredits[amount]
      if(credits == undefined ) throw new Error("Invalid amount");
      const createPayment = await dbServices.payments.createPayment(amount,"INR")
      if(!createPayment)throw new Error("Error in creating order")
      const orderDetails =   {
        orderId:createPayment?.id,
        userId:userId,
        credits:credits,
        amount:amount,
        method:"razorpay",
        status:"pending"
      }
      await dbServices.payments.insertPaymentDetails(orderDetails)
      res.status(200).send({status:true,message:"Payment Details Inserted",data:{orderId:createPayment?.id}})
    }catch(error:any){
      logger.error(`Error in payment:${error.mesage}`)
      res.status(500).send({status:false,message:error.message})
    }
  };

  static checkRazorPayPaymentStatus = async(req:Request,res:Response):Promise<any>=>{
    try {
      const webhookSignature = req.headers["x-razorpay-signature"] as string;
      const secret = "";
      const validate = this.verifyWebhookSignature(JSON.stringify(req.body), webhookSignature, secret);
      if(!validate) {
        throw new Error("Invalid Signature");
      }
      const { event, payload } = req.body;
      if (event === 'payment.authorized') {
        const orderId = payload.payment.entity.order_id;
        if(!orderId) {
          throw new Error("Order Id not found");
        }
        await dbServices.payments.confirmOrderStatus(orderId,"success");
      } else if (event === 'payment.failed') {
        const orderId = payload.payment.entity.order_id;
        if(!orderId) {
          throw new Error("Order Id not found");
        }
        await dbServices.payments.updateOrderStatus(orderId,"failed");
      }
      res.sendStatus(200);
    } catch (error) {
      logger.error(`Error in checking payment:${error.mesage}`)
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
      const userId=req["user"]["userId"].toString();
      const { amount, customerPhone } = req.body;
      const orderId = uniqid();
      const amountToCredits:any = {
        1:1,
        49: 40,
        100: 100,
        149: 200
      };
      const credits = amountToCredits[amount];
      if (credits === undefined) {
        throw new Error("Invalid amount");
      }
      const createPayment = await dbServices.payments.createCashfreeOrder(parseInt(amount),"INR",orderId ,userId,customerPhone)
      if(!createPayment){
        throw new Error("Error in creating order")
      }
        const details={
          orderId:createPayment?.order_id ,
          userId:userId,
          credits:credits,
          amount:amount,
          method:"cashfree",
          status:"pending"
        }
      await dbServices.payments.insertPaymentDetails(details)
      res.status(200).send({status:true,message:"Payment Details Inserted",data:{orderId:createPayment?.order_id, sessionId:createPayment?.payment_session_id}})
    } catch (error:any) {
      logger.error(`Error in creating order:${error.mesage}`)
      res.status(500).json({ error: error.message });
    }
  }


  static checkStatus = async(req:Request , res: Response)=>{
    try{
      const orderId = req.params.orderId
      const options  = {
        method:'GET',
        url:`https://sandbox.cashfree.com/pg/orders/${orderId}`,
        headers: {
          accept: 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.XClientId,
          'x-client-secret': process.env.XClientSecret,
        }
      }
      const response = await axios.request(options);
      if(response.data.order_status === 'PAID'){
       const data =  dbServices.payments.confirmOrderStatus(orderId,"success")
        res.redirect("https://0e8f-2401-4900-8843-9c99-16de-7ca9-378f-99a3.ngrok-free.app/success")
      }else{
        dbServices.payments.updateOrderStatus(orderId,"failed")
        res.redirect("https://0e8f-2401-4900-8843-9c99-16de-7ca9-378f-99a3.ngrok-free.app/failure")
      }
    }catch(error:any){
      logger.error(`Error in checking status:${error.mesage}`)
      res.status(500).json({ error: error.message });
    }
  }
}

