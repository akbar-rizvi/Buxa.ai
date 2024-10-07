import { Request, Response } from "express";
export default class user {
    static registerUser: (req: Request, res: Response) => Promise<void>;
    static loginUser: (req: Request, res: Response) => Promise<void>;
    static logoutUser: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=user.d.ts.map