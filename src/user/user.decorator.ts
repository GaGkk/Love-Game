import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ReqInterface } from 'src/interface/req.interface';

export const currentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<ReqInterface>();
    if (!req.user) {
      return null;
    }
    if (data) {
      return req.user[data];
    }
    return req.user;
  },
);
