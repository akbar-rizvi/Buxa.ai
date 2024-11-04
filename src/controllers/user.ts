import { Request, response, Response } from "express";
import dbServices from "../services/dbServices";
import axios from "axios";

interface authenticateReq {
  user?: any;
  body?: any;
}
export default class user {

  static googleLogIn = async (req: Request, res: Response) => {
    try {
      const token = req.query.token;
      const validateUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`);
      if (validateUser.data.verified_email == false){
        res.status(500).send({status: false,message: "Unauthorized email"});
      } 
      const genToken = await dbServices.user.googleLogIn(validateUser.data);
      const accessToken = genToken.token;
      const data = genToken.user;
      const { id, firstName, lastName, email, credits } = data;
      const response = {
        id:id,
        firstName:firstName,
        lastName:lastName,
        email:email,
        credits:parseInt(credits)
      };
      res.status(200).send({status: true,message: "LoggedIn",accessToken,data: response});
    } catch (error: any) {
      throw new Error(error);
    }
  };

  static userdetails = async (req: authenticateReq, res: Response) => {
    try {
      const user = req.user.userId;
      if (!user) {
        res.status(404).json({ status: false, message: "User not found" });
      }
      const data = await dbServices.user.userDetails(user);
      data[0].credits = parseInt(data[0].credits)
      res.status(200).send({ status: true, message: "user details", data: data[0] });
    } catch (e: any) {
      res.status(500).json({ status: false, message: e.mesage });
    }
  };

  static dashboardData= async(req:authenticateReq,res:Response)=>{
    try {
      const userId=req.user.userId
      const dashboard=await dbServices.user.dashboardData(userId)
      res.status(200).send({ status: true, message: "All dashboard data", data: dashboard });
    } catch (error) {
      res.status(500).json({ status: false, message: error.mesage });
    }
  }

}
