import { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    user?: any;
    body: any;
    params: any;
}
export default class document {
    static extractExcerptAndKeywords: (input: any) => Promise<{
        excerpt: any;
        keywords: any;
    }>;
    static createDocumentController: (req: AuthenticatedRequest, res: Response) => Promise<any>;
    static updateDocument: (req: AuthenticatedRequest, res: Response) => Promise<any>;
    static getDocumentsByUserIdController: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    static deleteDocumentByUserId: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    static toggleIsFavoriteByDocumentId: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=document.d.ts.map