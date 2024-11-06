import { Request, response, Response } from "express";
import dbServices from "../services/dbServices";
import axios from "axios";
import { envConfigs } from "../config/envConfig";
import url from "node:url"

interface authenticateReq {
  user?: any;
  body?: any;
}
export default class user {

  // static googleLogIn = async (req: Request, res: Response) => {
  //   try {
  //     const token = req.query.token;
  //     const validateUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`);
  //     if (validateUser.data.verified_email == false){
  //       res.status(500).send({status: false,message: "Unauthorized email"});
  //     } 
  //     const genToken = await dbServices.user.googleLogIn(validateUser.data);
  //     const accessToken = genToken.token;
  //     const data = genToken.user;
  //     const { id, firstName, lastName, email, credits } = data;
  //     const response = {
  //       id:id,
  //       firstName:firstName,
  //       lastName:lastName,
  //       email:email,
  //       credits:parseInt(credits)
  //     };
  //     res.status(200).send({status: true,message: "LoggedIn",accessToken,data: response});
  //   } catch (error: any) {
  //     throw new Error(error);
  //   }
  // };

  static googleSignInSignUp =  async(req:Request,res:Response)=>{
    try {
      const token = req.query.code;
      console.log(token,"::::")
      let clientId = envConfigs.googleClientId;
      let clientSecret = envConfigs.googleClientSecret;
      let REDIRECT_URI = envConfigs.redirecturl;
      const validateUser = await axios.post(`https://oauth2.googleapis.com/token`,{code:token,client_id: clientId,client_secret: clientSecret,redirect_uri:REDIRECT_URI,grant_type: "authorization_code"});
      const { id_token, access_token } = validateUser.data;
      const {email,name,picture} = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        console.error(`Failed to fetch user`);
        throw new Error(error.message);
      });
      if(!email) throw new Error("Error fetching email please try again");
      const genToken = await dbServices.user.googleLogIn(email,name);
      // const accessToken = genToken.token
      const userDetails = {
        id:genToken.user.id,
        firstName:genToken.user.firstName,
        lastName:genToken.user.lastName,
        email:genToken.user.email,
        credits:genToken.user.credits,
        accessToken:genToken.token
      }     
      let FRONTEND_REDIRECT_URL = envConfigs.frontendRedirectUrl;
      return res.redirect(url.format({
        pathname:`${FRONTEND_REDIRECT_URL}`,
        query:{user:JSON.stringify(userDetails)}
      }));
    } catch (error) {
      res.status(500).json({ status: false, message: error.mesage });
    }
  }

  static userdetails = async (req: authenticateReq, res: Response) => {
    try {
      const user = req.user.userId;
      if (!user) {
       throw new Error('User not found')
      }
      const data = await dbServices.user.userDetails(user);
      data[0].credits = parseInt(data[0].credits)
      res.status(200).send({ status: true, message: "user details", data: data[0] });
    } catch (e: any) {
      res.status(500).send({ status: false, message: e.mesage });
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
