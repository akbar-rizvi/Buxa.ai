import { Schema, model, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import envConf from "../config/envConf";

// Interface representing a User document in MongoDB
interface IUser extends Document {
    email: string;
    firstName: string;
    lastName: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): any;
    generateRefreshToken(): any;
    credits?: number; // Use lowercase `number` type for consistency
}

// Define the schema
const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        refreshToken: {
            type: String,
        },
        credits: {
            type: Number,
            default: 5,
        }
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware to hash the password before saving
// userSchema.pre<IUser>("save", async function (next) {
//     if (!this.isModified("password")) return next();
    
//     try {
//         this.password = await bcrypt.hash(this.password, 10);
//         next();
//     } catch (error) {
//         next(error);  // Pass error to the next middleware
//     }
// });

// Method to check if the entered password is correct
userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

// Method to generate an access token
userSchema.methods.generateAccessToken = function (): string {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        envConf.accessTokenSecret,
        {
            expiresIn: envConf.accessTokenExpiry,
        }
    );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign(
        {
            _id: this._id,
        },
        envConf.refreshTokenSecret,
        {
            expiresIn: envConf.refreshTokenExpiry,
        }
    );
};

// Create and export the User model
export const User: Model<IUser> = model<IUser>("User", userSchema);
