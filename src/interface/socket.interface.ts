import { Socket } from 'socket.io';
import { User } from 'src/user/user.entity';

export interface SocketInterface extends Socket {
  user?: User;
}
