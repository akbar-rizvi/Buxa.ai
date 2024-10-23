import express from "express";
import cors from "cors";
import logger from "./config/logger";
import router from "./routes";
import { envConfigs } from "./config/envConfig";

const app = express();

app.use(cors({ origin: "*"}));
app.use(express.json());
app.use('/', router);


app.listen(envConfigs.port, async () => {
    logger.info(`Server is running on port ${envConfigs.port}`);
    // await connectDB();
});
