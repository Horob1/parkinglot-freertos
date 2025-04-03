import express, { Express } from 'express';
import dotenv from 'dotenv';
import routes from './src/init/routes';
import db from './src/init/db';
import theApp from './src/init/theApp';
import cors from 'cors';
import { createServer } from 'http';
import { initSocket } from './src/init/socket';
import env from './src/helpers/env';
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
initSocket(httpServer);
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));
theApp(app);
db();
routes(app);

httpServer.listen(env.PORT, () => {
  console.log(`⚡️ [server]: Server is running at https://localhost:${env.PORT}`);
});
export default app;
