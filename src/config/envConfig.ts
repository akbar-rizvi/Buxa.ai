import * as dotenv from "dotenv";
dotenv.config();
import { z } from "zod";


const envVarsSchema = z.object({
  MODE: z.union([z.literal("prod"), z.literal("dev"), z.literal("staging")]),
  PORT: z.string().default("8000").transform((str) => parseInt(str, 10)),
  SALT: z.string().default("10").transform((str) => parseInt(str, 10)),
  PG_URL: z.string(), // PostgreSQL connection URL
  SECRET_KEY: z.string().default("varunkate"), // Assign default secret key
  SERPER_API_KEY:z.string(),
  OPEN_API_KEY:z.string(),
  SERPER_API_KEY_RESEARCH:z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  REDIRECT_URI:z.string().url(),
  FRONTEND_REDIRECT_URL:z.string().url(),
  EXPIRE_TIME: z.string(), // 1 hour
  GROQ_API_KEY1:z.string(),
  GROQ_API_KEY2:z.string(),
  // HOST: z.string(),
  // DBUSER: z.string(),
  // PASSWORD: z.string(),
  // DATABASE: z.string(),
  // DBPORT: z
  //   .string()
  //   .default("5432")
  //   .transform((str) => parseInt(str, 10)),
  // SSL: z.enum(["true", "false"]).transform((str) => str === "true"),
});

const envVars = envVarsSchema.parse(process.env);

export const envConfigs = {
  env: envVars.MODE,
  isDev: envVars.MODE === "dev",
  port: envVars.PORT || 8080,
  salt: envVars.SALT || 10,
  db: {
    // host: envVars.HOST,
    // user: envVars.DBUSER,
    // password: envVars.PASSWORD,
    // database:envVars.DATABASE,
    // port: envVars.DBPORT,
    // ssl: envVars.SSL,
    url: envVars.PG_URL, // PostgreSQL connection URL
  },
  jwt: {
    secret: envVars.SECRET_KEY,
  accessExpirationMinutes:envVars.EXPIRE_TIME
  },
  serperapikey:envVars.SERPER_API_KEY,
  openapikey:envVars.OPEN_API_KEY,
  serper_api_key_research : envVars.SERPER_API_KEY_RESEARCH,
  googleClientId:envVars.GOOGLE_CLIENT_ID,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
  redirecturl :envVars.REDIRECT_URI,
  frontendRedirectUrl:envVars.FRONTEND_REDIRECT_URL,
  groqapikey1:envVars.GROQ_API_KEY1,
  groqapikey2:envVars.GROQ_API_KEY2
};

export const isDev = envVars.MODE === "dev";
export const isProd = envVars.MODE === "prod";
export const isStaging = envVars.MODE === "staging";
