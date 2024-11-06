import postgresdb from "../../config/db";
import mongoose from "mongoose";
import { documents, users } from "../../models/schema";
import {and, desc, eq, inArray, sql,ne,asc} from "drizzle-orm";



export default class document{
    static createDocument = async (userId:number,content:any,metadata:any,keyword:any) => {
        try {
            return await postgresdb.transaction(async (tx) => {
                const userDetails = await postgresdb.select().from(users).where(eq(users.id,userId))
                if (userDetails[0].credits <= 0) throw new Error("Insufficent balance")
                const newDocument = await postgresdb.insert(documents).values({
                    userId,      
                    content,     
                    metadata,     
                    keyword,
                    documentType:"article"     
                }).returning({id:documents.id,content:documents.content,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite});
                const credits = await postgresdb.update(users).set({credits:sql`${userDetails[0].credits} - 1`,usedCredits:sql`${userDetails[0].usedCredits}+1`,totalContent:sql`${userDetails[0].totalContent}+1`,coc:sql`${userDetails[0].coc}+1`}).where(eq(users.id,userId)).returning({credits:users.credits}).execute()
                return {newDocument,credits}; 
            })
        } catch (error: any) {
            throw new Error(error.message || "Failed to create document");
        }
    };


    static getDocumentsByUserId = async (userId: number): Promise<any> => {
        try {
            const getDocument = await postgresdb.select({id:documents.id,content:documents.content,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite}).from(documents).where(and(eq(documents.userId, userId),eq(documents.isDeleted, false))).execute();
            return getDocument;
        } catch (erro:any) {
            console.error(erro);
            throw new Error(erro);
        }
    };

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
                return await postgresdb.insert(documents).values({
                    content:content,
                    userId:userId
                }).returning({content:documents.content,id:documents.id,updatedAt:documents.updatedAt,isFavorite:documents.isFavorite})
            }else{
                return await postgresdb.update(documents).set({content:content}).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).returning({id:documents.id,content:documents.content,userId:documents.userId}).execute()
            }
        }catch(error:any){
            throw new Error(error)
        }
    }


    static createResearch=async(userId:number,metaData:any,researchJson:any,content:any):Promise<any>=>{
        try {
            return await postgresdb.transaction(async (tx) => {
                const userDetails = await tx.select().from(users).where(eq(users.id,userId))
                if (userDetails[0].credits <= 0) throw new Error("Insufficent balance")
                const data=await tx.insert(documents).values({
                        userId:userId,
                        content:content,
                        metadata:metaData,
                        keyword:researchJson,
                        documentType:"research"
                    }).returning({id:documents.id,content:documents.content,isFavorite:documents.isFavorite,updatedAt:documents.updatedAt})
                await tx.update(users).set({
                    credits:sql`${userDetails[0].credits} - 1`,usedCredits:sql`${userDetails[0].usedCredits}+1`,totalResearch:sql`${userDetails[0].totalContent}+1`,cor:sql`${userDetails[0].coc}+1`
                }).where(eq(users.id,userId))
                return data
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
                return await postgresdb.update(documents).set({content:content}).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).returning({id:documents.id,content:documents.content,userId:documents.userId}).execute()
            }

        } catch (error) {
            throw new Error(error) 
        }
    }

    static deleteResearch=async(userId:number,documentId:number,index:number):Promise<any>=>{
        try {
            return await postgresdb.transaction(async (tx) => {
                const docData=await postgresdb.query.documents.findFirst({
                    where:and(eq(documents.id,documentId),eq(documents.userId,userId)),
                    columns:{
                        content:true
                    }
                })

                const content=docData.content.splice(index,index)
                return await postgresdb.update(documents).set({content:content}).where(and(eq(documents.userId,userId),eq(documents.id,documentId),eq(documents.isDeleted,false))).returning({id:documents.id,content:documents.content,userId:documents.userId}).execute()
            })
        } catch (error) {
            throw new Error(error) 
        }
    }
}