import { Request, Response } from "express";
import dbServices from "../services/dbServices";
import { aiWriter } from "../helper/ai";

export interface AuthenticatedRequest extends Request {
    user?: any;
    body:any;
    params:any
}

 
export default class document{


    static extractExcerptAndKeywords=async(input:any)=> {
        try {
            // Use regex to extract the excerpt and keywords
            const excerptMatch = input.match(/\*\*Excerpt\*\*:\s*([\s\S]*?)\n/);
            const keywordsMatch = input.match(/\*\*Keywords\*\*:\s*([\s\S]*)\./);
            
            if (!excerptMatch || !keywordsMatch) {
                console.error("Error: Could not extract excerpt or keywords");
                return null;
            }
        
            const excerpt = excerptMatch[1].trim();
            const keywords = keywordsMatch[1].split(',').map((keyword:any) => keyword.trim());
        
            return {
                excerpt: excerpt,
                keywords: keywords
            };
            
        } catch (error: any) {
            throw new Error(error)
        }
    }
    

    static createDocumentController = async (req: AuthenticatedRequest, res: Response):Promise<any> => {
        try {
            // console.log(req.body)
            const userId = req.user;
            const { metadata} = req.body;  
            const ai=await aiWriter(metadata.title,metadata.personality,metadata.tone) 
            // console.log(ai,"ai")
            let cleanedArticle;
            let cleanedExcerpt;
            if (ai) {
                cleanedArticle = ai.article.replace(/\n\s*\+\s*/g, '');
                cleanedExcerpt = ai.excerpt.replace(/\n\s*\+\s*/g, '');
                ai.article = cleanedArticle;
                ai.excerpt = cleanedExcerpt;
            }
            const keyword = await this.extractExcerptAndKeywords(cleanedExcerpt);
            const docData=await dbServices.document.createDocument(userId, cleanedArticle, metadata,keyword);
            res.status(200).send({status:true,message:"Document Created Successfully",data:docData});
        } catch (error: any) {
            res.status(500).json({ status:false,error: error.message });
        }
    };

    static updateDocument= async (req: AuthenticatedRequest, res: Response):Promise<any> => {
        try {
            const userId = req.user;
            const content=req.body.content
            const docId=req.params.documentId
            const updatedDoc=await dbServices.document.updateDocument(userId, docId,content);
            res.status(200).send({status:true,message:"Document Updated Successfully",data:updatedDoc});
        } catch (error: any) {
            res.status(500).json({ status:false,error: error.message });
        }
    };

    // Fetch documents by user ID
    static getDocumentsByUserIdController = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user;
            const documents = await dbServices.document.getDocumentsByUserId(userId);
            res.status(200).send({status:true,message:"All documents fetched",data:documents});
        } catch (error: any) {
            res.status(500).send({ status:false,error: error.message });
        }
    };

    static getDocumentById=async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user;
            const docId=req.params.documentId
            const documents = await dbServices.document.getDocumentById(userId,docId);
            res.status(200).send({status:true,message:"Document fetched ",data:documents});
        } catch (error: any) {
            res.status(500).send({ status:false,error: error.message });
        }
    };

    // Delete a document by user ID
    static deleteDocumentByUserId = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user;
            const documentId = req.params.documentId;
            const result = await dbServices.document.deleteDocumentById(userId, documentId);
            if (result) {
                res.status(200).send({status:true, message: "Document deleted successfully" });
            } else {
                res.status(404).send({status:false, message: "Document not found or not authorized to delete" });
            }
        } catch (error) {
            res.status(500).send({ status:false,error: error.message });
        }
    };

    // toggle  isFavorite of document by document ID
    static toggleIsFavoriteByDocumentId = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user;
            const documentId = req.params.documentId;
            const result = await dbServices.document.updateIsFavoriteByDocumentId(userId, documentId);
            if (result) {
                res.status(200).send({status:false, message: "Document isFavorite updated successfully" });
            } else {
                res.status(404).send({status:false,
                    message: "Document not found or not authorized to update isFavorite",
                });
            }
        } catch (error) {
            res.status(500).send({ status:false,error: error.message });
        }
    };
}