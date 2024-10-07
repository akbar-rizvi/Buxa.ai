import { Document, Model } from "mongoose";
interface IUser extends Document {
    phoneNumber: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}
export declare const User: Model<IUser>;
export {};
//# sourceMappingURL=user.model.d.ts.map