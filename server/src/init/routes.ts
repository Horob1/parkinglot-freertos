import { Express } from 'express';
import cardRoutes from '../mvc/routes/card.routes';
import authRoutes from '../mvc/routes/auth.routes';
import userRoutes from '../mvc/routes/user.routes';
import slotRoutes from '../mvc/routes/slot.routes';
import logRoutes from '../mvc/routes/log.routes';
import clientRoutes from '../mvc/routes/client.routes';
import uploadRoutes from '../mvc/routes/upload.routes';
import configRoutes from '../mvc/routes/config.routes';
import statsRoutes from '../mvc/routes/stats.routes';
import errorHandler from '../mvc/middlewares/error';

export default (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/log', logRoutes);
  app.use('/api/slot', slotRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/card', cardRoutes);
  app.use('/api/client', clientRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/stats', statsRoutes);
  app.use(errorHandler);
};
