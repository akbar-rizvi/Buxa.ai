import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../models/schema"
import logger from "./logger";
import { envConfigs } from "./envConfig";


// export let client = new Client({
//   host: process.env.HOST,
//   port: dbport,
//   user: process.env.DBUSER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE
// });

export const client=new Client(envConfigs.db.url)

client.connect().then(()=>{
  logger.info("Postgress Client is Connected Successfully")
  
}).catch((err:any)=>{
  logger.error("Error connecting DB : ",err)
  
});

const postgresdb = drizzle(client,{schema:{...schema}});

export default postgresdb