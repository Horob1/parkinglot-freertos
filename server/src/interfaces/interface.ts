import { JwtPayload } from 'jsonwebtoken';
export interface IATPayload extends JwtPayload {
  _id: string;
}
