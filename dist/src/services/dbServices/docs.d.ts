import mongoose from "mongoose";
export default class document {
    static createDocument: (userId: mongoose.Types.ObjectId, content: any, metadata: any, keyword: any) => Promise<any>;
    static updateDocument: (userId: mongoose.Types.ObjectId, docId: mongoose.Types.ObjectId, content: any) => Promise<any>;
    static getDocumentsByUserId: (userId: mongoose.Types.ObjectId) => Promise<any>;
    static deleteDocumentById: (userId: mongoose.Types.ObjectId, documentId: string) => Promise<boolean>;
    static updateIsFavoriteByDocumentId: (userId: mongoose.Types.ObjectId, documentId: string) => Promise<boolean>;
}
//# sourceMappingURL=docs.d.ts.map