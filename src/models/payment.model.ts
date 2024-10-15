import mongoose, { Schema, Document as MongooseDocument } from "mongoose";


const payment= new Schema({
  orderId: {type:String}, 
  userId: {type:Schema.Types.ObjectId, ref: 'User',required: true},
  amount: {type:String},
  credits: {type:Number,default:0},
  paymentStatus: { type: String, default: "pending" },
  paymentMethod: {type:String},
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('payment', payment);