import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../models/schema"
import logger from "./logger";
import { envConfigs } from "./envConfig";


// export let client = new Client({
//   host: envConfigs.db.host,
//   port: envConfigs.db.port,
//   user: envConfigs.db.user,
//   password: envConfigs.db.password,
//   database: envConfigs.db.database
// });

export const client=new Client(envConfigs.db.url)

client.connect().then(()=>{
  logger.info("Postgress Client is Connected Successfully")
  
}).catch((err:any)=>{
  logger.error("Error connecting DB : ",err)
  
});

const postgresdb = drizzle(client,{schema:{...schema}});

export default postgresdb