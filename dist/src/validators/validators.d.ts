import { z } from 'zod';
export default class validators {
    static registerUserSchema: z.ZodObject<{
        body: z.ZodObject<{
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            phoneNumber: z.ZodNumber;
            password: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            phoneNumber?: number;
            email?: string;
            firstName?: string;
            lastName?: string;
            password?: string;
        }, {
            phoneNumber?: number;
            email?: string;
            firstName?: string;
            lastName?: string;
            password?: string;
        }>;
        params: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {
            phoneNumber?: number;
            email?: string;
            firstName?: string;
            lastName?: string;
            password?: string;
        };
        params?: {};
    }, {
        query?: {};
        body?: {
            phoneNumber?: number;
            email?: string;
            firstName?: string;
            lastName?: string;
            password?: string;
        };
        params?: {};
    }>;
    static loginUserSchema: z.ZodObject<{
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            email?: string;
            password?: string;
        }, {
            email?: string;
            password?: string;
        }>;
        params: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {
            email?: string;
            password?: string;
        };
        params?: {};
    }, {
        query?: {};
        body?: {
            email?: string;
            password?: string;
        };
        params?: {};
    }>;
    static logoutUserSchema: z.ZodObject<{
        body: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            refreshToken?: string;
        }, {
            refreshToken?: string;
        }>;
        params: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {
            refreshToken?: string;
        };
        params?: {};
    }, {
        query?: {};
        body?: {
            refreshToken?: string;
        };
        params?: {};
    }>;
    static createDocument: z.ZodObject<{
        body: z.ZodObject<{
            metadata: z.ZodObject<{
                title: z.ZodString;
                personality: z.ZodArray<z.ZodString, "atleastone">;
                tone: z.ZodString;
                language: z.ZodString;
                useCase: z.ZodString;
                researchLevel: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                useCase?: string;
                researchLevel?: number;
                personality?: [string, ...string[]];
                tone?: string;
                language?: string;
                title?: string;
            }, {
                useCase?: string;
                researchLevel?: number;
                personality?: [string, ...string[]];
                tone?: string;
                language?: string;
                title?: string;
            }>;
        }, "strict", z.ZodTypeAny, {
            metadata?: {
                useCase?: string;
                researchLevel?: number;
                personality?: [string, ...string[]];
                tone?: string;
                language?: string;
                title?: string;
            };
        }, {
            metadata?: {
                useCase?: string;
                researchLevel?: number;
                personality?: [string, ...string[]];
                tone?: string;
                language?: string;
                title?: string;
            };
        }>;
        params: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {
            metadata?: {
                useCase?: string;
                researchLevel?: number;
                personality?: [string, ...string[]];
                tone?: string;
                language?: string;
                title?: string;
            };
        };
        params?: {};
    }, {
        query?: {};
        body?: {
            metadata?: {
                useCase?: string;
                researchLevel?: number;
                personality?: [string, ...string[]];
                tone?: string;
                language?: string;
                title?: string;
            };
        };
        params?: {};
    }>;
    static getDocumentsById: z.ZodObject<{
        body: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        params: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {};
        params?: {};
    }, {
        query?: {};
        body?: {};
        params?: {};
    }>;
    static deleteDocumentById: z.ZodObject<{
        body: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        params: z.ZodObject<{
            documentId: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            documentId?: string;
        }, {
            documentId?: string;
        }>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {};
        params?: {
            documentId?: string;
        };
    }, {
        query?: {};
        body?: {};
        params?: {
            documentId?: string;
        };
    }>;
    static updateDocumentIsFavourite: z.ZodObject<{
        body: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        params: z.ZodObject<{
            documentId: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            documentId?: string;
        }, {
            documentId?: string;
        }>;
        query: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    }, "strip", z.ZodTypeAny, {
        query?: {};
        body?: {};
        params?: {
            documentId?: string;
        };
    }, {
        query?: {};
        body?: {};
        params?: {
            documentId?: string;
        };
    }>;
}
//# sourceMappingURL=validators.d.ts.map