import express from "express";
import cors from "cors";
import logger from "./config/logger";
import router from "./routes";
import { envConfigs } from "./config/envConfig";
import passport from "passport";
import { jwtStrategy } from "./config/jwt";


const app = express();

app.use(cors({ origin: "*"}));
app.use(express.json());

passport.use('jwt', jwtStrategy);

app.use('/', router);


app.listen(envConfigs.port, async () => {
    logger.info(`Server is running on port ${envConfigs.port}`);
    // await connectDB();
});
