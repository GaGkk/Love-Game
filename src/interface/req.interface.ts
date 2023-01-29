import { Request } from 'express';
import { User } from 'src/user/user.entity';

export interface ReqInterface extends Request {
  user?: User;
}
