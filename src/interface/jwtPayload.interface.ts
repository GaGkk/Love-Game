import { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadInterface extends JwtPayload {
  id: string;
}
