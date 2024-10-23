import * as dotenv from "dotenv";
dotenv.config();
import { z } from "zod";


const envVarsSchema = z.object({
  MODE: z.union([z.literal("prod"), z.literal("dev"), z.literal("staging")]),
  PORT: z.string().default("8000").transform((str) => parseInt(str, 10)),
  SALT: z.string().default("10").transform((str) => parseInt(str, 10)),
  PG_URL: z.string(), // PostgreSQL connection URL
  SECRET_KEY: z.string().default("varunkate"), // Assign default secret key
  SERPER_API_KEY:z.string()
});

const envVars = envVarsSchema.parse(process.env);

export const envConfigs = {
  env: envVars.MODE,
  isDev: envVars.MODE === "dev",
  port: envVars.PORT || 8080,
  salt: envVars.SALT || 10,
  db: {
    url: envVars.PG_URL, // PostgreSQL connection URL
  },
  jwt: {
    secret: envVars.SECRET_KEY,
  },
  serperapikey:envVars.SERPER_API_KEY
};

export const isDev = envVars.MODE === "dev";
export const isProd = envVars.MODE === "prod";
export const isStaging = envVars.MODE === "staging";
