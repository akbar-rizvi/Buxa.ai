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
const document_model_1 = __importDefault(require("../../models/document.model"));
class document {
}
_a = document;
document.createDocument = (userId, content, metadata, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newDocument = new document_model_1.default({
            user: userId,
            content,
            metadata,
            keyword
        });
        return yield newDocument.save();
    }
    catch (error) {
        throw new Error(error);
    }
});
document.updateDocument = (userId, docId, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedDocument = yield document_model_1.default.findOneAndUpdate({ user: userId, _id: docId }, // Query to find the document by userId
        { content: content }, // Update the content field
        { new: true, upsert: true } // Return the updated document, and create it if it doesn't exist
        );
        return updatedDocument;
    }
    catch (error) {
        throw new Error(error);
    }
});
// Fetch documents by user ID
document.getDocumentsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield document_model_1.default.find({ user: userId, isDeleted: false }).select("-user");
    }
    catch (error) {
        throw new Error(error);
    }
});
// Service to delete a document by document ID and user ID
document.deleteDocumentById = (userId, documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the document and update its isDeleted field to true
        const result = yield document_model_1.default.findOneAndUpdate({ _id: documentId, user: userId }, { isDeleted: true }, { new: true });
        return result !== null; // Return true if the document was found and updated
    }
    catch (error) {
        throw new Error(error);
    }
});
document.updateIsFavoriteByDocumentId = (userId, documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield document_model_1.default.findOne({ _id: documentId, user: userId });
        if (!document) {
            return false;
        }
        document.isFavorite = !document.isFavorite;
        const result = yield document.save();
        return result !== null;
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.default = document;
//# sourceMappingURL=docs.js.map