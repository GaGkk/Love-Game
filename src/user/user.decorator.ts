import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressReqInterface } from 'src/interface/expressreq.interface';

export const currentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<ExpressReqInterface>();
    if (!req.user) {
      return null;
    }
    if (data) {
      return req.user[data];
    }
    return req.user;
  },
);
