import DocumentModel from "../../models/document.model"; 
import mongoose from "mongoose";
import { User } from "../../models/user.model";


export default class document{

    static createDocument = async (
        userId: mongoose.Types.ObjectId,
        content: any,
        metadata: any,
        keyword:any
    ):Promise<any> => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const findCredits=await User.findById(userId)
            if(findCredits.credits=0){
                throw new Error("No enough Credits")
            }
            await User.findByIdAndUpdate(
                userId,
                {$inc:{credits:-1}}
            )

            const newDocument = new DocumentModel({
                user: userId,
                content,
                metadata,
                keyword
    
            });
            const data=await newDocument.save();

            
        await session.commitTransaction();
        session.endSession();
        return data
            
        } catch (error:any) {
            await session.abortTransaction();
            session.endSession();
            throw new Error(error)
        }
    };

    static updateDocument= async (
        userId: mongoose.Types.ObjectId,
        docId:mongoose.Types.ObjectId,  
        content: any,        
    ):Promise<any> => {
        try {
            const updatedDocument = await DocumentModel.findOneAndUpdate(
                { user: userId, _id: docId },   
                { content: content }, 
                { new: true, upsert: true } 
            );
            
            return updatedDocument;
            
        } catch (error:any) {
            throw new Error(error)
        }
    };

    // Fetch documents by user ID
    static getDocumentsByUserId = async (userId: mongoose.Types.ObjectId):Promise<any> => {
        try {
            return await DocumentModel.find({ user: userId, isDeleted: false }).populate('user') 
            
        } catch (error:any) {
            throw new Error(error)
        }
    };

    static getDocumentById= async (userId: mongoose.Types.ObjectId,documentId:mongoose.Types.ObjectId):Promise<any> => {
        try {
            return await DocumentModel.findOne({_id:documentId,user:userId},{content:1,_id:0})
            
        } catch (error:any) {
            throw new Error(error)
        }
    };

    // Service to delete a document by document ID and user ID
    static deleteDocumentById = async (userId: mongoose.Types.ObjectId, documentId: string) => {
        try {
            // Find the document and update its isDeleted field to true
                const result = await DocumentModel.findOneAndUpdate(
                    { _id: documentId, user: userId }, 
                    { isDeleted: true }, 
                    { new: true } 
                );

                return result !== null; // Return true if the document was found and updated
                    
        } catch (error:any) {
            throw new Error(error)
        }
    };


    static updateIsFavoriteByDocumentId = async (
        userId: mongoose.Types.ObjectId,
        documentId: string
    ) => {
        try {
            const document = await DocumentModel.findOne({ _id: documentId, user: userId });
                if (!document) {
                    return false;
                }

                document.isFavorite = !document.isFavorite;
                const result = await document.save();

                return result !== null;
            
            
        } catch (error:any) {
            throw new Error(error)
        }
    }
}