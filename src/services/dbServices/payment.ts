import user from "../../controllers/user";
import paymentModel from "../../models/payment.model";
import { User } from "../../models/user.model";
import { Cashfree } from "cashfree-pg"; 

Cashfree.XClientId = process.env.XClientId;
Cashfree.XClientSecret = process.env.XClientSecret;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

export class Payment{

  static createPayment=async(data:any):Promise<any>=>{
    try {
        await paymentModel.create({
            userId: data.userId,
            amount: data.amount,
            orderId: data.orderId,
            credits: data.credits,
            paymentMethod: data.paymentMethod,
            paymentStatus: "pending", 
        });
        
        
    } catch (error) {
        throw new Error(error);
    }
}




  static createCashfreeOrder = async (amount: number, currency: string, orderId: string, userId: any, customerPhone: string): Promise<any> => {
    try {
      const request = {
        order_amount: amount,
        order_currency: currency,
        order_id: orderId,
        customer_details: {
          customer_id: userId._id,
          customer_phone: customerPhone,
        },
        // order_meta: {
        //   return_url: `https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}`,
        // },
      };
      const response = await Cashfree.PGCreateOrder("2023-08-01", request);
      console.log(response.data);
      return response.data;
    } catch (error) {
      // console.error('Error:', error.response.data.message);
      throw new Error(error.response.data.message);
    }
  };




  static confirmOrderStatus = async (orderId: any, paymentStatus: string): Promise<any> => {
    try {
      // Check the incoming data
      console.log("Updating order:", orderId, paymentStatus);
  
      // Ensure that the order exists and is updated
      const updatePayment = await paymentModel.findOneAndUpdate(
        { orderId: orderId },
        { $set: { paymentStatus: paymentStatus } },
        { new: true } // Return the updated document
      );
  
      if (!updatePayment) {
        console.error("Order not found for orderId:", orderId);
        return null; // Or handle it accordingly
      }
  
      console.log("Updated payment:", updatePayment);
  
      // Increment user credits if the payment update is successful
      const updatedUser = await User.findByIdAndUpdate(
        updatePayment.userId,
        { $inc: { credits: updatePayment.credits } },
        { new: true } // Return the updated user document
      );
  
      if (!updatedUser) {
        console.error("User not found for userId:", updatePayment.userId);
        return null; // Or handle it accordingly
      }
  
      console.log("Updated user credits:", updatedUser.credits);
      return updatedUser;
  
    } catch (error) {
      console.error("Error in confirmOrderStatus:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };
  

  static updateOrderStatus=async(orderId:any,paymentStatus:string):Promise<any>=>{
    try {
        const updatePayment=await paymentModel.findOneAndUpdate({
          orderId:orderId
        },    
        {
           $set: { paymentStatus: paymentStatus }
        },
        { new: true }
      ) 
    }catch(error){
      throw new Error(error);
    }
  }
}