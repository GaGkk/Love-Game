import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { WsException } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const webSocket = context.switchToWs();
    const client = webSocket.getClient<Socket>();
    const bearerToken = client.handshake.headers.authorization.split(' ')[1];

    if (!bearerToken) {
      throw new WsException('Token is required');
    }

    try {
      const decode = verify(bearerToken, process.env.JWT_SECRET);
      const user = await this.userService.getUserbyId(decode.toString());
      context.switchToHttp().getRequest().user = user;

      return !!user;
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
