import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SocketInterface } from 'src/interface/socket.interface';

@Injectable()
export class WsGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient<SocketInterface>();
    if (socket.user) {
      return true;
    }
    socket.disconnect(true);
    throw new WsException({ status: 401, message: 'Not Authorized!' });
  }
}
