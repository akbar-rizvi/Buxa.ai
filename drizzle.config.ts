import {envConfigs} from "./src/config/envConfig"


export default ({
  dialect: "postgresql", 
  schema: "./src/models/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // host: process.env.HOST,
    // user: process.env.DBUSER,
    // password: process.env.PASSWORD,
    // database: process.env.DATABASE,
    // ssl: false,
    url:envConfigs.db.url
  },
});