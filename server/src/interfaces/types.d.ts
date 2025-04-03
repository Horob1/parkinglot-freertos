import 'express';
import { IATPayload } from './interface';
declare module 'express' {
  interface Request {
    user?: IATPayload;
  }
}
