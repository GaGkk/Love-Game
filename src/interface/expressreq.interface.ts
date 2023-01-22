import { Request } from 'express';
import { User } from 'src/user/user.entity';

export interface ExpressReqInterface extends Request {
  user?: User;
}
