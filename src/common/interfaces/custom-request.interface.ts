import { Request } from 'express';
import { UserDocument } from '../../users/users.schema';

export interface CustomRequest extends Request {
  user?: UserDocument;
  decodedToken?: any;
}
