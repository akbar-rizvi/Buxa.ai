"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
class validators {
}
validators.registerUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, "First name is required"),
        lastName: zod_1.z.string().min(1, "Last name is required"),
        email: zod_1.z.string().email("Invalid email"),
        phoneNumber: zod_1.z.number().min(10, "Phone number should be at least 10 characters"),
        password: zod_1.z.string().min(6, "Password should be at least 6 characters")
    }).strict(),
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict()
});
validators.loginUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email"),
        password: zod_1.z.string().min(6, "Password should be at least 6 characters")
    }).strict(),
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict()
});
validators.logoutUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, "Refresh token is required")
    }).strict(),
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict()
});
validators.createDocument = zod_1.z.object({
    body: zod_1.z.object({
        metadata: zod_1.z.object({
            title: zod_1.z.string().min(1, "Title is required"),
            personality: zod_1.z.array(zod_1.z.string()).nonempty("Personality array must have at least one element"),
            tone: zod_1.z.string().min(1, "Tone is required"),
            language: zod_1.z.string().min(1, "Language is required"),
            useCase: zod_1.z.string().min(1, "Use case is required"),
            researchLevel: zod_1.z.number().optional()
        }).strict()
    }).strict(),
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict()
});
validators.getDocumentsById = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict()
});
validators.deleteDocumentById = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        documentId: zod_1.z.string({ required_error: "Document Id is required" })
    }).strict(),
    query: zod_1.z.object({}).strict()
});
validators.updateDocumentIsFavourite = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        documentId: zod_1.z.string({ required_error: "Document Id is required" })
    }).strict(),
    query: zod_1.z.object({}).strict()
});
exports.default = validators;
//# sourceMappingURL=validators.js.map