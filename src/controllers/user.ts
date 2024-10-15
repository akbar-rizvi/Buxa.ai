import { Request, Response } from "express";
import { User } from "../models/user.model";
import dbServices from "../services/dbServices";
import { razorpay } from "../helper/razorpay";
import axios from "axios"
import url from "node:url";

export default class user{

        // Controller for handling user registration
        
        static registerUser = async (req: Request, res: Response): Promise<void> => {
            const { firstName, lastName, email, phoneNumber, password } = req.body;
        
            try {
                // Call the service to register a new user
                const newUser = await dbServices.user.registerUser({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password,
                });
        
                // Generate access token and refresh token using instance methods
                const accessToken = newUser.generateAccessToken();
                const refreshToken = newUser.generateRefreshToken();
        
                // Save the refresh token to the newUser document in the database
                newUser.refreshToken = refreshToken;
                await newUser.save();
        
                // Return a success response
                res.status(200).send({
                    status: true,
                    message: "User registered successfully",
                    accessToken,
                    refreshToken,
                    newUser
                });
            } catch (error: any) {
                res.status(500).json({ status: false, message: error.message });
            }
        };
        
    

    // static googleSignInSignUp =  async(req:Request,res:Response)=>{
    //     try {
    //       const token = req.query.code;
    //       let clientId = process.env.googleClientId;
    //       let clientSecret = process.env.googleClientSecret;
    //       let REDIRECT_URI = process.env.redirectUri;
    //       const validateUser = await axios.post(`https://oauth2.googleapis.com/token`,{code:token,client_id: clientId,client_secret: clientSecret,redirect_uri:REDIRECT_URI,grant_type: "authorization_code"});
    //       const { id_token, access_token } = validateUser.data;
    //       const {email,name,picture} = await axios
    //       .get(
    //         `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    //         {
    //           headers: {
    //             Authorization: `Bearer ${id_token}`,
    //           },
    //         }
    //       )
    //       .then((res) => res.data)
    //       .catch((error) => {
    //         console.error(`Failed to fetch user`);
    //         throw new Error(error.message);
    //       });
    //       if(!email) throw new Error("Error fetching email please try again");
    
    
    //       let userExists = await dbServices.user.login({email});
    //       if (!userExists) {
    //         const createBody = {
    //             email: email,
    //             name: name
    //         };
    //         userExists=await dbServices.user.register(createBody); 
    //       }
    //       let FRONTEND_REDIRECT_URL = process.env.frontendRedirectUrlLocal;
    
    //       return res.redirect(url.format({
    //         pathname:`${FRONTEND_REDIRECT_URL}`,
    //         query:{user:JSON.stringify(userExists)}
    //       }));
    //     } catch (error) {
    //       console.log(error);
    //       // return res.redirect(url.format({
    //       //   pathname:`${FRONTEND_REDIRECT_URL}`,
    //       //   query:{
    //       //     error_message:error["message"]
    //       //   }
    //       // }));
    //     }
    //   }
    

// Controller for handling user login
    static loginUser = async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;
        try {
            const user = await dbServices.user.loginUser(email , password);
            res.status(200).send({status: true , message: "user Logged In" , data : user})
        } catch (error:any) {
            res.status(500).send({status:false, message: error.message });
        }
    };


    static logoutUser = async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;
        console.log(refreshToken,":::::::::::")

        if (!refreshToken) {
            res.status(400).send({ message: "Invalid refresh token!" });
            return;
        }

        try {
            const user = await User.findOne({ refreshToken });
            console.log(user,"@@@@@@@@@@@@@@@@@@@@@@@@")

            if (!user) {
                res.status(404).send({ message: "User not found or already logged out" });
                return;
            }

            user.refreshToken = "";

            await user.save();

            res.status(200).send({status:true, message: "Logout successful" });
        } catch (error) {
            console.log(error.message)
            res.status(500).send({ status:false,error: error.message });
        }
    };

    // static updateUser=async(req:Request,res:Response)=>{
    //     try {
    //         const userId=req["user"]
    //         await dbServices.user.updateUser(userId,req.body)
    //         res.status(200).send({status:true, message: "Profile updated Successfully" });
    //     } catch (error) {
    //         res.status(500).send({ status:false,error: error.message });
    //     }
    // }

    static googleLogIn = async (req:Request,res:Response)=>{
        try{
            console.log("In the google LogIn")
            const token = req.query.token;
            const validateUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`);

            if (validateUser.data.verified_email == false) res.status(500).send({status:false,message:"Your email is not authorized by Google"})

            const genToken = await dbServices.user.googleLogIn(validateUser.data)
            console.log(genToken,"genToken")
            res.status(200).send({status:true,message:"LoggedIn with Google",genToken})
        }catch(error:any){
            throw new Error(error)
        }
    }

    
 
}