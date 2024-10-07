import mongoose, { Document as MongooseDocument } from "mongoose";
interface Metadata {
    useCase: string;
    primaryKey: string;
    researchLevel: number;
    personality: string[];
    tone: string[];
    language: string;
}
interface keyword {
    excerpt: string;
    keywords: string[];
}
interface IDocument extends MongooseDocument {
    user: mongoose.Schema.Types.ObjectId;
    content: string;
    metadata: Metadata;
    isDeleted: boolean;
    isFavorite: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    keyword: keyword;
}
declare const keyword: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    keywords: string[];
    excerpt?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    keywords: string[];
    excerpt?: string;
}>> & mongoose.FlatRecord<{
    keywords: string[];
    excerpt?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v?: number;
}>;
declare const DocumentModel: mongoose.Model<IDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDocument> & IDocument & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>;
export default DocumentModel;
//# sourceMappingURL=document.model.d.ts.map