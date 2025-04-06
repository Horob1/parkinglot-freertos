import { Express } from 'express';
import cardRoutes from '../mvc/routes/card.routes';
import authRoutes from '../mvc/routes/auth.routes';
import userRoutes from '../mvc/routes/user.routes';
import slotRoutes from '../mvc/routes/slot.routes';
import logRoutes from '../mvc/routes/log.routes';
import auth from '../mvc/middlewares/auth';
import errorHandler from '../mvc/middlewares/error';

export default (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/log', logRoutes);
  app.use('/api/slot', slotRoutes);
  app.use(auth);
  app.use('/api/user', userRoutes);
  app.use('/api/card', cardRoutes);
  app.use(errorHandler);
};
