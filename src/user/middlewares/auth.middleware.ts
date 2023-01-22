import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressReqInterface } from 'src/interface/expressreq.interface';
import { verify } from 'jsonwebtoken';
import { UserService } from '../user.service';
import { JwtPayloadInterface } from 'src/interface/jwtPayload.interface';

@Injectable()
export class AuthMiddleWare implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressReqInterface, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      const { id } = verify(token, 'secret') as JwtPayloadInterface;
      const user = await this.userService.getUserbyId(id);
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}
