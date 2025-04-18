import express, { Express } from 'express';
import dotenv from 'dotenv';
import routes from './src/init/routes';
import db from './src/init/db';
import theApp from './src/init/theApp';
import cors from 'cors';
import { createServer } from 'http';
import { initSocket } from './src/init/socket';
import env from './src/helpers/env';
import path from 'path';
import fs from 'fs';
dotenv.config();

const app: Express = express();
app.use(express.static(path.join(__dirname, 'fe')));
//check upload folder exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}
app.use('/media', express.static(path.join(__dirname, 'uploads')));
const httpServer = createServer(app);
initSocket(httpServer);
const corsOptions = {
  origin: '*',
  credentials: true,
};
app.use(cors(corsOptions));
theApp(app);
db();
routes(app);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'fe', 'index.html'));
});

httpServer.listen(env.PORT, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${env.PORT}`);
});
export default app;
