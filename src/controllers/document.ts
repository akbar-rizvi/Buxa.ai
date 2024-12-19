import { Request, Response } from "express";
import dbServices from "../services/dbServices";
import { aiWriter } from "../helper/article";
import { marked } from "marked";
import { extractExcerptAndKeywords } from "../helper/documentKywordFilter";
import { researchArticle } from "../helper/research";
import logger from "../config/logger";
import { publishToGhost } from "../helper/blog-publication";
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface AuthenticatedRequest extends Request {
  user?: any;
  body: any;
  params: any;
}

export default class document {
  static createDocument = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const UserId = req.user.userId;
      if (!UserId) {
        throw new Error("Invalid User");
      }
      const CheckUser = await dbServices.user.userDetails(UserId);
      if (CheckUser[0].credits == 0) {
        throw new Error("Insufficent balance");
      }
      const { metadata } = req.body;
      // console.log("metaData:::",metadata.title)
      if (!metadata.deepDive) {
        const ai = await aiWriter(
          metadata.title,
          metadata.personality,
          metadata.tone
        );
        let cleanedArticle;
        let cleanedExcerpt;
        if (ai) {
          cleanedArticle = ai.article.replace(/\n\s*\+\s*/g, "");
          cleanedExcerpt = ai.excerpt.replace(/\n\s*\+\s*/g, "");
          ai.article = cleanedArticle;
          ai.excerpt = cleanedExcerpt;
        }
        let finalContent;
        if (cleanedArticle) {
          finalContent = marked(cleanedArticle);
        }
        const keyword = await extractExcerptAndKeywords(cleanedExcerpt);
        const documentData: any = await dbServices.document.createDocument(
          UserId,
          finalContent,
          metadata,
          keyword
        );
        const wordCount = cleanedArticle
          ?.split(/\s+/)
          .filter((word) => word.length > 0).length;
        documentData.newDocument[0].wordCount = wordCount;
        return res.status(200).send({
          status: true,
          message: "Document Created Successfully",
          data: documentData.newDocument[0],
          credits: parseInt(documentData.credits[0].credits),
        });
      } else {
        throw new Error("Invalid format");
      }
    } catch (error: any) {
      logger.error(`Error in create Document:${error}`);
      res.status(500).send({ status: false, error: error.message });
    }
  };

  static createResearch = async (req: Request, res: Response) => {
    try {
      const userId = req["user"].userId;
      // const userId = 12
      const docId = req.query.id.toString();
      if (!userId) {
        throw new Error("Invalid User");
      }
      const CheckUser = await dbServices.user.userDetails(userId);
      if (CheckUser[0].credits == 0) {
        throw new Error("Insufficent balance");
      }
      const { metadata } = req.body;
      console.log(metadata.topics);
      const research = await researchArticle(
        metadata.topic,
        metadata.timeRange,
        metadata.deepDive
      );
      const contentArray = await Promise.all(
        research.articleContentArray.map(async (content) => ({
          content: await marked(content.replace(/#/g, "")), // Convert markdown and assign to content
          isDeleted: false, // Set isDeleted as false
        }))
      );
      // console.log("ContentArray:::|||||||||",contentArray)
      const { data, credits } = await dbServices.document.createResearch(
        userId,
        metadata,
        research.allArticles,
        contentArray,
        parseInt(docId)
      );
      res.status(200).send({
        status: true,
        message: "Document Created Successfully",
        data,
        credits: parseInt(credits[0].credits),
      });
    } catch (error) {
      logger.error(`Error in create Research:${error.mesage}`);
      console.log("error in create research", error);
      res.status(500).send({ status: false, error: error.message });
    }
  };

  static countWords(content: string): number {
    // Ensure content is a string before processing
    const plainText = String(content).replace(/<[^>]*>/g, ""); // Remove HTML tags
    const words = plainText.trim().split(/\s+/); // Split by whitespace
    return words.filter((word) => word.length > 0).length; // Count non-empty words
  }

  static getDocumentsByUserId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user.userId;
      // const userId = 12
      const documents = await dbServices.document.getDocumentsByUserId(userId);
      const responseWithWordCount = documents.map((item: any) => ({
        ...item,
        wordCount: this.countWords(item.content),
      }));
      res.status(200).send({
        status: true,
        message: "All documents fetched",
        data: responseWithWordCount,
      });
    } catch (error) {
      logger.error(`Error in getting Document:${error.mesage}`);
      res.status(500).json({ status: false, error: error.message });
    }
  };

  static getResearchbyUserId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user.userId;
      // const userId = 12
      if (!userId) {
        throw new Error("Invalid User");
      }
      const researchData = await dbServices.document.getResearchbyUserId(
        userId
      );
      res.status(200).send({
        status: true,
        message: "All research fetched",
        data: researchData,
      });
    } catch (error) {
      logger.error(`Error in getting Research:${error.mesage}`);
      res.status(500).json({ status: false, error: error.message });
    }
  };

  static deleteDocumentByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req["user"].userId;
      // const userId = 12
      const documentId = req.params.documentId;
      const result = await dbServices.document.deleteDocumentById(
        userId,
        parseInt(documentId)
      );
      if (!result) {
        throw new Error("Invalid document");
      }
      res
        .status(200)
        .send({ status: true, message: "Document deleted successfully" });
    } catch (error: any) {
      logger.error(`Error in deleting document:${error.mesage}`);
      res.status(500).send({ status: false, error: error.message });
    }
  };

  static toggleIsFavoriteByDocumentId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user.userId;
      const documentId = req.params.documentId;
      const result = await dbServices.document.updateIsFavoriteByDocumentId(
        userId,
        parseInt(documentId)
      );
      if (result) {
        res.status(200).send({
          status: true,
          message: "Document isFavorite updated successfully",
        });
      } else {
        throw new Error("Unauthorized User");
      }
    } catch (error) {
      logger.error(`Error in is Favorite:${error.mesage}`);
      res.status(500).json({ status: false, error: error.message });
    }
  };

  static getDocumentById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.userId;
      console.log("userId", userId);
      const documentId = req.params.documentId;
      if (!userId) throw new Error("Unauthorized User");
      const result = await dbServices.document.getDocumentsById(
        userId,
        parseInt(documentId)
      );
      res
        .status(201)
        .send({ status: true, message: "Get Document Successfully", result });
    } catch (error: any) {
      logger.error(`Error in getting Document:${error.mesage}`);
      res.status(500).json({ status: false, error: error.message });
    }
  };

  static updateDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.userId;
      const documentId = req.params.documentId;
      const content = req.body.content;
      if (!userId) throw new Error("Unauthorized User");
      const updateDoc: any = await dbServices.document.updateDoc(
        userId,
        parseInt(documentId),
        content
      );
      const wordCount = content
        ?.split(/\s+/)
        .filter((word: any) => word.length > 0).length;
      updateDoc[0].wordCount = wordCount;
      res.status(200).send({
        message: "Document Updated Successfully",
        status: true,
        data: updateDoc[0],
      });
    } catch (error: any) {
      logger.error(`Error in updating Document:${error.mesage}`);
      res.status(500).send({ message: error.message, status: false });
    }
  };

  static updateResearch = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.userId;
      const documentId = req.params.documentId;
      const content = req.body.content;
      if (!userId) throw new Error("Unauthorized User");
      const updateDoc: any = await dbServices.document.updateResearch(
        userId,
        parseInt(documentId),
        content
      );
      res.status(200).send({
        message: "Research Updated Successfully",
        status: true,
        data: updateDoc[0],
      });
    } catch (error) {
      logger.error(`Error in updating research:${error.mesage}`);
      res.status(500).send({ message: error.message, status: false });
    }
  };

  static deleteResearch = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.userId;
      // const userId = 12
      const documentId = req.params.documentId;
      const index = req.query.index.toString();
      if (!userId) throw new Error("Unauthorized User");
      const deletedDoc = await dbServices.document.deleteResearch(
        userId,
        parseInt(documentId),
        parseInt(index)
      );
      // console.log(deletedDoc)
      res.status(200).send({
        message: "Research deleted Successfully",
        status: true,
        data: deletedDoc,
      });
    } catch (error) {
      logger.error(`Error in deleting research:${error.mesage}`);
      res.status(500).send({ message: error.message, status: false });
    }
  };

  static postToBlogSite = async (req: Request, res: Response) => {
    try {
      const userId = req["user"].userId;
      if (!userId) throw new Error("Unauthorized User");
      // console.log("BODY",req.body)
      const { id, postOn, content, metadata, keyword, tag } = req.body.data;
      // console.log("Varun")
      const { apiKey, ghostURL } = req.body.data.data;
      // console.log("metaData:",metadata)
      console.log("apiKey", apiKey);
      const slug = metadata.title.split(" ").join("-");
      await publishToGhost(
        apiKey,
        content,
        metadata.title,
        slug,
        tag,
        keyword.excerpt,
        ghostURL,
        postOn
      );
      await dbServices.document.postToBlogSite(userId, id);
      res.status(200).send({ status: true, message: `Blog Post Successfully` });
    } catch (error) {
      logger.error(`Error in posting To LegalWire:${error}`);
      console.log(error);
      res.status(500).send({ message: error.message, status: false });
    }
  };

  static createBlogaPI = async (req: Request, res: Response) => {
    try {
      const userId = req["user"].userId;
      if (!userId) throw new Error("Unauthorized User");
      await dbServices.document.createBlogaPI(userId, req.body.data);
      res.status(200).send({ status: true, message: `Created Successfully` });
    } catch (error) {
      logger.error(`Error in posting To LegalWire:${error}`);
      res.status(500).send({ message: error.message, status: false });
    }
  };

  static getAllBlogData = async (req: Request, res: Response) => {
    try {
      const userId = req["user"].userId;
      if (!userId) throw new Error("Unauthorized User");
      const getAllBlogData = await dbServices.document.getAllBlogData(userId);
      res
        .status(200)
        .send({ status: true, message: `All Blog data`, data: getAllBlogData });
    } catch (error) {
      logger.error(`Error in posting To LegalWire:${error}`);
      res.status(500).send({ message: error.message, status: false });
    }
  };

  static async uploadImage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // Check if a file is provided
      if (!req.file) {
        res.status(400).json({ message: "No image file provided" });
        return;
      }

      // Upload the file to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      // Cast the result to Cloudinary's upload response type
      const { secure_url } = uploadResult as { secure_url: string };

      // Respond with the Cloudinary URL
      res
        .status(200)
        .json({ message: "Image uploaded successfully", url: secure_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      res
        .status(500)
        .json({ message: "Failed to upload image", error: error.message });
    }
  }
}
