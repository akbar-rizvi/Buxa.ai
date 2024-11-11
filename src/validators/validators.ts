import { z } from "zod";

export default class validators {
  static registerUserSchema = z.object({
    body: z
      .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email"),
        phoneNumber: z
          .string()
          .min(10, "Phone number should be at least 10 characters"),
        password: z.string().min(6, "Password should be at least 6 characters"),
      })
      .strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  static loginUserSchema = z.object({
    body: z
      .object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password should be at least 6 characters"),
      })
      .strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  static logoutUserSchema = z.object({
    body: z
      .object({
        refreshToken: z.string().min(1, "Refresh token is required"),
      })
      .strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  static createDocument = z.object({
    body: z
      .object({
        metadata: z
          .object({
            title: z.string({
              required_error:"title is required"
            }),
            researchLevel: z
              .number()
              .optional(),
            personality: z
              .array(z.string())
              .nonempty("Personality array must have at least one element"),
            tone: z.string({required_error:"Tone is required"}),
            language: z.string().min(1, "Language is required").optional(),
            useCase: z.string().min(1, "Use case is required").optional(),
          })
          .strict(),
      })
      .strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  static getDocumentsById = z.object({
    body: z.object({}).strict(),   
    params: z.object({}).strict(),  
    query: z.object({}).strict(),  
  });

  static getAllBlogData = z.object({
    body: z.object({}).strict(),   
    params: z.object({}).strict(),  
    query: z.object({}).strict(),  
  });

  static userdetails = z.object({
    body: z.object({}).strict(),   
    params: z.object({}).strict(),  
    query: z.object({}).strict(),  
  });

  static getResearchbyUserId = z.object({
    body: z.object({}).strict(),   
    params: z.object({}).strict(),  
    query: z.object({}).strict(),  
  });

  static googleLogin = z.object({
    body: z.object({
      
    }).strict(),
    params: z.object({}).strict(),
    query: z.object({
      code: z.string({required_error: "code is required"})
    }).strict(),
  }).strict();

  static createBlogaPI = z.object({
    body: z.object({
      data: z.object({
        blogUrl: z.string({required_error:"Blog Url is required"}),
        blogApi: z.string({required_error:"Blog Api is required"})
      }).strict()
    }).strict(),   
    params: z.object({}).strict(),  
    query: z.object({}).strict(),  
  });

  static postToBlogSite = z.object({
    body: z.object({
      data: z.object({
        apiKey: z.string({required_error:"API key is required"}),
        postOn: z.string({required_error:"Post on is required"}), 
        content: z.string({required_error:"Content is required"}),
        metadata: z.object({
          title: z.string({required_error:"Title is required"})
        }).strict(),
        keyword: z.object({
          excerpt: z.string({required_error:"Excerpt is required"})
        }).strict(),
        tag: z.string({required_error:"Tag is required"}),
        ghostURL: z.string().url({ message: "Invalid URL format" }),
        status: z.enum(["Draft", "Published"], { message: "Status must be either 'Draft' or 'Published'" })
      }).strict()
    }).strict()
  });

  static deleteDocumentById = z.object({
    body: z.object({}).strict(),  
    params: z.object({
        documentId: z.string().refine((id) => !isNaN(Number(id)), {
            message: "documentId must be a number",  
        }),
    }).strict(),  
    query: z.object({
      
    }).strict(),  
});

  static deleteResearchDocument = z.object({
    body: z.object({}).strict(),  
    params: z.object({
        documentId: z.string().refine((id) => !isNaN(Number(id)), {
            message: "documentId must be a number",  
        }),
    }).strict(),  
    query: z.object({
      index:z.string({required_error:"Index is required"})
    }).strict(),  
});

  static updateDocumentIsFavourite = z.object({
    body: z.object({}).strict(),
    params: z
      .object({
        documentId: z.string({ required_error: "Document Id is required" }),
      })
      .strict(),
    query: z.object({}).strict(),
  });

  static updateDocument = z.object({
    body: z.object({
        content: z.string(), // Validates that 'content' is a non-empty string
    }),
    params: z.object({
        documentId: z.string()
    }),
    query: z.object({}).strict(),
});

  static updateResearch = z.object({
    body: z.object({
        content: z.array(z.string()), // Validates that 'content' is a non-empty string
    }),
    params: z.object({
        documentId: z.string()
    }),
    query: z.object({}).strict(),
});

static createResearch = z.object({
  body: z
    .object({
      metadata: z
        .object({
          topic: z.array(z.string()),
          format: z.string()
            .optional(),
          timeRange: z.string({required_error:"Time range is required"}),
          focus: z.string().optional(),
          source: z.string().optional(),
          deepDive: z.boolean({required_error:"Deep dive is required"}),

        })
        .strict(),
    })
    .strict(),
  params: z.object({}).strict(),
  query: z.object({
    id:z.string({required_error:"Id is required"})
  }).strict(),
});
}
