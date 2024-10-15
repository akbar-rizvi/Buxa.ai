import { User } from "../../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import envConf from "../../config/envConf";
import DocumentModel from "../../models/document.model";
import paymentModel from "../../models/payment.model";


export default class user{


    static registerUser = async (userData: any):Promise<any> => {
        try {
            const { phoneNumber, email, firstName, lastName, password } = userData;
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists with this email");
            }

            const newUser = new User({
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
            });

            return await newUser.save();
            
        } catch (error) {
            throw new Error(error)
        }
    };

    static loginUser = async (email: string, password: string):Promise<any> => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            const isPasswordValid = await user.isPasswordCorrect(password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }

    //         // Generate tokens
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // Save refresh token
            user.refreshToken = refreshToken;
            await user.save();

            return { accessToken, refreshToken, user };
            
        } catch (error) {
            throw new Error(error);
        }
    };


    static register=async(details:any):Promise<any>=>{
        try {
            const newUser = new User({
                            firstName:details?.name,
                            email:details?.email,
                            password:null,
                            credits:5
                        });
            
            const data= await newUser.save();
            if(data){
                const accessToken = data.generateAccessToken();
                const refreshToken = data.generateRefreshToken() 
    
                return {data,accessToken,refreshToken}
    
                }

          
        } catch (error) {
          throw new Error(error)
        }
    
      }

    static login = async(details:any):Promise<any>=>{
        try{
            const user= await User.findOne(
                {email:details.email},
            )
            if(user){
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            return {user,accessToken,refreshToken}

            }
          
        }catch(error){
          throw new Error(error.message)
        }
      }

    static  refreshToken = async (refreshToken: string) => {
        try {
            const decoded = jwt.verify(refreshToken, envConf.refreshTokenSecret) as any;
            const user = await User.findById(decoded._id);
            if (!user) throw new Error("User not found");

            // Generate new access token
            const accessToken = user.generateAccessToken();
            return { accessToken };
        } catch (error) {
            throw new Error(error);
        }
    }

    // static updateUser=async(userId:number,data:any):Promise<any>=>{
    //     try {
    //         const findUser=await User.findOne({_id:userId},{_id:0})
    //         if(findUser.password!=data.password){
    //             throw new Error("Password is incorrect")
    //         }
    //         const updateUser=await User.findOneAndUpdate(
    //             {_id:userId},
    //             {firstName:data.firstName,lastName:data.lastName,email:data.email,password:data.password}
    //         )
    //         if(!updateUser){
    //             throw new Error("Error in updating user")
    //         }
            
    //     } catch (error) {
    //         throw new Error(error);
    //     }
    // }


    static googleLogIn = async (userDetails: any):Promise<any> => {
        try {
            const user = await User.findOne({ email: userDetails.email });
            if (!user) {
                const newUser = new User({
                    firstName: userDetails.given_name,
                    lastName: userDetails.family_name.trim(),
                    email: userDetails.email.trim(),
                    credits : 5

                });

                const savedUser = await newUser.save();
                const accessToken = newUser.generateAccessToken()
                const refreshToken = newUser.generateRefreshToken()
                
                newUser.refreshToken = refreshToken;
                await newUser.save();

                // console.log("Registered User Token:", token);
                return {accessToken,savedUser,refreshToken};
            }
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // Save the new refresh token to the existing user's document
            user.refreshToken = refreshToken;
            await user.save();
            return {accessToken,user,refreshToken};
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    
}
