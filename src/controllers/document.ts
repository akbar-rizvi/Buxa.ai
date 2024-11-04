import { Request, Response } from "express";
import { spawn } from 'child_process';
import dbServices from "../services/dbServices";
import { aiWriter } from "../helper/ai";
import {marked} from "marked"
import { extractExcerptAndKeywords } from "../helper/documentKywordFilter";

interface AuthenticatedRequest extends Request {
    user?: any;
    body:any;
    params:any
}

 
export default class document{
    static createDocument = async (req: AuthenticatedRequest, res: Response):Promise<any> => {
        try {
            let UserId= req.user.userId;
            const { metadata } = req.body;  
            const ai=await aiWriter(metadata.title,metadata.personality,metadata.tone) 
            let cleanedArticle;
            let cleanedExcerpt;
            if (ai) {
                cleanedArticle = ai.article.replace(/\n\s*\+\s*/g, '');
                cleanedExcerpt = ai.excerpt.replace(/\n\s*\+\s*/g, '');
                ai.article = cleanedArticle;
                ai.excerpt = cleanedExcerpt;
            }
            let finalContent
            if (cleanedArticle){ 
                finalContent = marked(cleanedArticle)
            }
            const keyword = await extractExcerptAndKeywords(cleanedExcerpt);
            const documentData:any = await dbServices.document.createDocument(UserId,finalContent,metadata,keyword);
            const wordCount = cleanedArticle?.split(/\s+/).filter(word => word.length > 0).length;
            documentData.newDocument[0].wordCount = wordCount
            res.status(201).send({status:true,message:"Document Created Successfully",data:documentData.newDocument[0],credits:parseInt(documentData.credits[0].credits)});
        } catch (error:any) {
            res.status(500).send({ status: false ,error: error.message });
        }
    };


    // static createDocument = async(req:AuthenticatedRequest, res:Response) => {
    //     try {
    //         let UserId = req.user.userId;
    //         const { metadata } = req.body;
    //         const pythonProcess = spawn('python3', ['path_to_your_python_script.py', metadata.title, metadata.personality, metadata.tone]);
    
    //         pythonProcess.stdout.on('data', async (data) => {
    //             let aiResponse;
    //             try {
    //                 aiResponse = JSON.parse(data.toString()); // Ensure Python script outputs JSON
    //             } catch (error) {
    //                 return res.status(500).send({ status: false, error: "Invalid response from Python script" });
    //             }
    
    //             let cleanedArticle = aiResponse.article.replace(/\n\s*\+\s*/g, '');
    //             let cleanedExcerpt = aiResponse.excerpt.replace(/\n\s*\+\s*/g, '');
    //             let finalContent = marked(cleanedArticle);
    //             const keyword = await extractExcerptAndKeywords(cleanedExcerpt);
    //             const documentData = await dbServices.document.createDocument(UserId, finalContent, metadata, keyword);
    //             const wordCount = cleanedArticle.split(/\s+/).filter(word => word.length > 0).length;
    //             documentData.newDocument[0]["wordCount"] = wordCount;
                
    //             res.status(201).send({
    //                 status: true,
    //                 message: "Document Created Successfully",
    //                 data: documentData.newDocument[0],
    //                 credits: parseInt(documentData.credits[0].credits)
    //             });
    //         });
    
    //         pythonProcess.stderr.on('data', (error) => {
    //             res.status(500).send({ status: false, error: error.toString() });
    //         });
    
    //         pythonProcess.on('exit', (code) => {
    //             if (code !== 0) {
    //                 res.status(500).send({ status: false, error: "Python script exited with error" });
    //             }
    //         });
    //     } catch (error) {
    //         res.status(500).send({ status: false, error: error.message });
    //     }
    // };

    static getDocumentsByUserId = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user.userId;
            const documents = await dbServices.document.getDocumentsByUserId(userId);
            const docWithWords = documents.map((document:any)=>{
                return {...document,words:document.content.split(/\s+/).filter((word: string | any[]) => word.length > 0).length}
            })
            res.status(200).send({status:true,message:"All documents fetched",data:docWithWords});
        } catch (error) {
            res.status(500).json({status:false, error: error.message });
        }
    };

    static deleteDocumentByUserId = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user.userId;
            const documentId = req.params.documentId;
            const result = await dbServices.document.deleteDocumentById(userId, parseInt(documentId));
            if (result) {
                res.status(200).json({ status:true,message: "Document deleted successfully" });
            } else {
                res.status(404).json({status:false, message: "Document not found or not authorized to delete" });
            }
        } catch (error:any) {
            res.status(500).json({status:false, error: error.message });
        }
    };

    static toggleIsFavoriteByDocumentId = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user.userId;
            const documentId = req.params.documentId;
            const result = await dbServices.document.updateIsFavoriteByDocumentId(userId, parseInt(documentId));
            if (result) {
                res.status(200).json({status:true, message: "Document isFavorite updated successfully"});
            } else {
                res.status(400).json({status:false,message: "Unauthorized User",});
            }
        } catch (error) {
            res.status(500).json({status:false, error: error.message });
        }
    };


    static getDocumentById = async (req: AuthenticatedRequest,res:Response)=>{
        try{
            const userId = req.user.userId;
            const documentId = req.params.documentId;
            if(!userId || !documentId){
                res.status(500).send({status:false,messsage:"Unauthorized User"})
            }
            const result = await dbServices.document.getDocumentsById(userId,parseInt(documentId))
            res.status(200).send({status:true,message:"Get Documnet Successfully",result})
        }catch(error:any){
            res.status(500).json({status:false, error: error.message});
        }
    }

    static updateDocument = async(req:AuthenticatedRequest,res:Response)=>{
        try{
            const userId = req.user.userId;
            const documentId = req.params.documentId
            const content = req.body.content
            if(!content || !documentId || !userId){
                res.status(500).send({message:"Unauthorized",status:false})
            }
            const updateDoc:any = await dbServices.document.updateDoc(userId,parseInt(documentId),content)
            const wordCount = content?.split(/\s+/).filter((word:any) => word.length > 0).length;
            updateDoc[0].wordCount = wordCount
            res.status(200).send({message:"Document Updated Successfully",status:true,data:updateDoc[0]})
        }catch(error:any){
            res.status(500).send({message:error.message,status:false})
        }
    }
}