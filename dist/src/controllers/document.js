"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dbServices_1 = __importDefault(require("../services/dbServices"));
const ai_1 = require("../helper/ai");
class document {
}
_a = document;
document.extractExcerptAndKeywords = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use regex to extract the excerpt and keywords
        const excerptMatch = input.match(/\*\*Excerpt\*\*:\s*([\s\S]*?)\n/);
        const keywordsMatch = input.match(/\*\*Keywords\*\*:\s*([\s\S]*)\./);
        if (!excerptMatch || !keywordsMatch) {
            console.error("Error: Could not extract excerpt or keywords");
            return null;
        }
        const excerpt = excerptMatch[1].trim();
        const keywords = keywordsMatch[1].split(',').map((keyword) => keyword.trim());
        return {
            excerpt: excerpt,
            keywords: keywords
        };
    }
    catch (error) {
        throw new Error(error);
    }
});
document.createDocumentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(req.body)
        const userId = req.user;
        const { metadata } = req.body;
        const ai = yield (0, ai_1.aiWriter)(metadata.title, metadata.personality, metadata.tone);
        // console.log(ai,"ai")
        let cleanedArticle;
        let cleanedExcerpt;
        if (ai) {
            cleanedArticle = ai.article.replace(/\n\s*\+\s*/g, '');
            cleanedExcerpt = ai.excerpt.replace(/\n\s*\+\s*/g, '');
            ai.article = cleanedArticle;
            ai.excerpt = cleanedExcerpt;
        }
        const keyword = yield _a.extractExcerptAndKeywords(cleanedExcerpt);
        const docData = yield dbServices_1.default.document.createDocument(userId, cleanedArticle, metadata, keyword);
        res.status(200).send({ status: true, message: "Document Created Successfully", data: docData });
    }
    catch (error) {
        console.error("Error creating document:", error);
        res.status(500).send({ error: error.message });
    }
});
document.updateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const content = req.body.content;
        const docId = req.params.documentId;
        const updatedDoc = yield dbServices_1.default.document.updateDocument(userId, docId, content);
        res.status(200).send({ status: true, message: "Document Updated Successfully", data: updatedDoc });
    }
    catch (error) {
        console.error("Error creating document:", error);
        res.status(500).send({ error: error.message });
    }
});
// Fetch documents by user ID
document.getDocumentsByUserIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("/")
        const userId = req.user;
        // console.log(userId)
        const documents = yield dbServices_1.default.document.getDocumentsByUserId(userId);
        res.status(200).send({ status: true, message: "All documents fetched", data: documents });
    }
    catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ error: error.message });
    }
});
// Delete a document by user ID
document.deleteDocumentByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const documentId = req.params.documentId;
        const result = yield dbServices_1.default.document.deleteDocumentById(userId, documentId);
        if (result) {
            res.status(200).json({ message: "Document deleted successfully" });
        }
        else {
            res.status(404).json({ message: "Document not found or not authorized to delete" });
        }
    }
    catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// toggle  isFavorite of document by document ID
document.toggleIsFavoriteByDocumentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const documentId = req.params.documentId;
        const result = yield dbServices_1.default.document.updateIsFavoriteByDocumentId(userId, documentId);
        if (result) {
            res.status(200).json({ message: "Document isFavorite updated successfully" });
        }
        else {
            res.status(404).json({
                message: "Document not found or not authorized to update isFavorite",
            });
        }
    }
    catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.default = document;
//# sourceMappingURL=document.js.map