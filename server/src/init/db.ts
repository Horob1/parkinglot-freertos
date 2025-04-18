import mongoose from 'mongoose';
import env from '../helpers/env';
import { initRootUser } from './root-user';
import { initRootSlot } from './root-slot';
import { initRootConfig } from './root-config';

export default () => {
  const mongoString = env.MONGO_STRING;

  mongoose
    .set('strictQuery', true)
    .connect(mongoString)
    .then(async () => {
      console.log(`⚡️ [server]: Db is connected!`);
      // Initialize root user, slots, cards after successful connection
      await Promise.all([initRootUser(), initRootSlot(), initRootConfig()]);
    })
    .catch((error: any) => {
      console.error('Database connection error:', error);
    });
};
