import {  users, documents  } from "../../models/schema"
import postgresdb from "../../config/db";

import { generateAuthTokens } from "../../config/jwt";
import { eq } from "drizzle-orm";


export default class user{

    
    static googleLogIn = async(email:string,name:string)=>{
        try{
            const user:any= await postgresdb.select().from(users).where(eq(users.email, email)).limit(1);
            if (user.length <= 0) {
                const nameParts = name.split(" ")
                const user:any = await postgresdb.insert(users).values({
                    firstName:nameParts[0],
                    lastName:nameParts.slice(1).join(" "),
                    email:email,
                    phoneNumber:'null',
                    password:'null'
                }).returning();
                const token = generateAuthTokens({userId:user[0].id})
                return {token:token,user:user[0]}
            }
            const token = generateAuthTokens({userId:user[0].id})
            return {token,user:user[0]}
        }catch(error:any){
            throw new Error(error)
        }
    }


    static userDetails = async(data:number):Promise<any>=>{
        try{
        const details = await postgresdb.select({
            id:users.id,
            firstName:users.firstName,
            lastName:users.lastName,
            email:users.email,
            credits:users.credits
        }).from(users).where(eq(users.id, data)).limit(1);
        return details;
        }catch(error){
            throw new Error(error)
        }
    }

    static dashboardData=async(userId:number):Promise<any>=>{
        try {
            return await postgresdb.query.users.findFirst({
                where:eq(users.id,userId),
                columns:{
                    credits:true,
                    usedCredits:true,
                    totalContent:true,
                    totalResearch:true,
                    totalAlerts:true,
                    coc:true,
                    cor:true,
                    coa:true
                },
                with:{
                    documents:{
                        columns:{
                            content:true,
                            documentType:true,
                            createdAt:true
                        }
                    },
                    alert:{
                        columns:{
                            alertContent:true,
                            createdAt:true,
                            metaData:true
                        }
                    }
                }
            })
        } catch (error) {
            throw new Error(error)
        }
    }

}