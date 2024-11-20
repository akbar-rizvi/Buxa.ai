import { error } from "console";
import postgresdb from "../../config/db";
import { blogApis, documents, users } from "../../models/schema";
import {and, eq, sql,} from "drizzle-orm";
import { text } from "drizzle-orm/mysql-core";



export default class document{
    static createDocument = async (userId:number,content:any,metadata:any,keyword:any) => {
        try {
            return await postgresdb.transaction(async (tx) => {
                const userDetails = await postgresdb.select().from(users).where(eq(users.id,userId))
                const newDocument = await postgresdb.insert(documents).values({
                    userId,      
                    content,     
                    metadata,     
                    keyword,
                    documentType:"article"     
                }).returning({id:documents.id,content:documents.content,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite,metadata:documents.metadata,keyword:documents.keyword});
                const credits = await postgresdb.update(users).set({credits:sql`${userDetails[0].credits} - 1`,usedCredits:sql`${userDetails[0].usedCredits}+1`,totalContent:sql`${userDetails[0].totalContent}+1`,coc:sql`${userDetails[0].coc}+1`}).where(eq(users.id,userId)).returning({credits:users.credits}).execute()
                return {newDocument,credits}; 
            })
        } catch (error: any) {
            throw new Error(error || "Failed to create document");
        }
    };


    static getDocumentsByUserId = async (userId: number): Promise<any> => {
        try {
            const getDocument = await postgresdb.select({id:documents.id,content:documents.content,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite,isPosted:documents.isPosted}).from(documents).where(and(eq(documents.userId, userId),eq(documents.isDeleted, false),eq(documents.documentType,"article"))).execute();
            return getDocument;
        } catch (error:any) {
            throw new Error(error);
        }
    };

    static getResearchbyUserId=async(userId:number):Promise<any>=>{
        try {
            return postgresdb.query.documents.findMany({
                where:and(eq(documents.userId,userId),eq(documents.documentType,"research"),eq(documents.isDeleted,false))
            })
            
        } catch (error) {
            throw new Error(error);
        }
    }

    static deleteDocumentById = async (userId: number, documentId: number): Promise<boolean> => {
        try {
            
            const result =  await postgresdb.update(documents).set({isDeleted: true}).where(and(eq(documents.id,documentId),eq(documents.userId,userId),eq(documents.isDeleted,false))).returning({ id: documents.id }).execute();
            return result.length > 0
        } catch (error:any) {
            throw new Error(error);
        }
    };

    static updateIsFavoriteByDocumentId = async (userId: number, documentId: number): Promise<boolean> => {
        try {
            return await postgresdb.transaction(async (tx) => {
                const document = await tx.select().from(documents).where(and(eq(documents.id, documentId),eq(documents.userId, userId))).execute();
                if (document.length === 0) {
                    return false;
                }
                const isFavorite = !document[0].isFavorite;
                const result = await tx.update(documents).set({ isFavorite: isFavorite }).where(and(eq(documents.id, documentId),eq(documents.userId, userId))).returning({ id: documents.id }).execute();
                return result.length > 0;
            })
        } catch (error:any) {
            throw new Error(error);
        }
    };

    static getDocumentsById = async (userId:number,documentId:number):Promise<any> => {
        try{
            const getDocument = await postgresdb.select().from(documents).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).execute();
            return getDocument   
        }catch(error:any){
            throw new Error(error)
        }

    }

    static updateDoc = async(userId:number,documentId:number,content:string)=>{
        try{
            if(documentId==0){
                console.log("hey")
                return await postgresdb.insert(documents).values({
                    content:content,
                    userId:userId,
                    documentType:"article"
                }).returning({content:documents.content,id:documents.id,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite})
            }else{
                return await postgresdb.update(documents).set({content:content}).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).returning({id:documents.id,content:documents.content,userId:documents.userId}).execute()
            }
        }catch(error:any){
            throw new Error(error)
        }
    }


    static createResearch=async(userId:number,metaData:any,researchJson:any,content:any,id:number):Promise<any>=>{
        try {
            return await postgresdb.transaction(async (tx) => {
                if(id==0){
                    const userDetails = await tx.select().from(users).where(eq(users.id,userId))
                    const data=await tx.insert(documents).values({
                            userId:userId,
                            content:content,
                            metadata:metaData,
                            keyword:researchJson,
                            documentType:"research"
                        }).returning({id:documents.id,content:documents.content,isFavorite:documents.isFavorite,updatedAt:documents.updatedAt,keyword:documents.keyword})
                    await tx.update(users).set({
                        credits:sql`${userDetails[0].credits} - 1`,usedCredits:sql`${userDetails[0].usedCredits}+1`,totalResearch:sql`${userDetails[0].totalResearch}+1`,cor:sql`${userDetails[0].cor}+1`
                    }).where(eq(users.id,userId))
                    return data
                }else{
                    const userDetails = await tx.select().from(users).where(eq(users.id,userId))
                    const data= await tx.query.documents.findFirst({
                        where:eq(documents.id,id),
                        columns:{
                            content:true,
                            metadata:true,
                            keyword:true
                        }
                    })
                    const newContent=[...data.content,...content]
                    let metadata=[]
                    metadata.push(data.metadata,metaData)
                    const newKeyword=[...data.keyword,...researchJson]
                    const updatedData=await tx.update(documents).set({
                        content:newContent,
                        metadata:metadata,
                        keyword:newKeyword,
                    }).where(eq(documents.id,id)).returning({id:documents.id,content:documents.content,isFavorite:documents.isFavorite,updatedAt:documents.updatedAt})
                    await tx.update(users).set({
                        credits:sql`${userDetails[0].credits} - 1`,usedCredits:sql`${userDetails[0].usedCredits}+1`,totalResearch:sql`${userDetails[0].totalResearch}+1`,cor:sql`${userDetails[0].cor}+1`
                    }).where(eq(users.id,userId))
                    return updatedData
                }
                
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    static updateResearch=async(userId:number,documentId:number,content:any):Promise<any>=>{
        try {
            if(documentId==0){
                return await postgresdb.insert(documents).values({
                    content:content,
                    userId:userId
                }).returning({content:documents.content,id:documents.id,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite})
            }else{
                return await postgresdb.update(documents).set({content:content}).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).returning({id:documents.id,content:documents.content,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite}).execute()
            }

        } catch (error) {
            throw new Error(error) 
        }
    }

    static deleteResearch=async(userId:number,documentId:number,index:number):Promise<any>=>{
        try {
            // console.log(index,";::::")
            return await postgresdb.transaction(async (tx) => {
                const docData=await tx.query.documents.findFirst({
                    where:and(eq(documents.id,documentId),eq(documents.userId,userId),eq(documents.isDeleted,false)),
                    columns:{
                        content:true
                    }
                })
                if (docData==undefined) throw new Error("Invalid Document")
                if (docData.content.length<=index) throw new Error("Invalid index")
                // docData.content.splice(index,1)
                docData.content[index].isDeleted = true
                const length = docData.content.filter((item:any) => !item.isDeleted).length
                if(length==0){
                    return await tx.update(documents).set({content:docData.content,isDeleted: true}).where(and(eq(documents.id,documentId),eq(documents.userId,userId),eq(documents.isDeleted,false))).returning({id:documents.id}).execute()
                }
                else return await tx.update(documents).set({content:docData.content}).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).returning({id:documents.id,content:documents.content,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite}).execute()
                
            })
        } catch (error) {
            throw new Error(error) 
        }
    }

    static createBlogaPI=async(userId:number,data:any)=>{
        try {
            await postgresdb.insert(blogApis).values({
                userId:userId,
                blogSite:data.blogSite,
                blogType:data.blogType
            }) 
        } catch (error) {
            throw new Error(error) 
        }
    }

    static getAllBlogData=async(userId:number):Promise<any>=>{
        try {
            return await postgresdb.query.blogApis.findMany({
                where:eq(blogApis.userId,userId)
            })
            
        } catch (error) {
            throw new Error(error)  
        }
    }

    static postToBlogSite = async(userId:number,docId:number):Promise<any>=>{
        try{
            const condition = and(eq(documents.userId,userId),eq(documents.id,docId),eq(documents.isDeleted,false))
            return await postgresdb.update(documents).set({isPosted:true})
            .where(condition).execute()
        }catch(error){
            throw new Error(error)
        }
    }
    
}