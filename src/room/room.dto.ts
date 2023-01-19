export class RoomDto {
  messages: {
    from: number;
    message: string;
    createdAt: Date;
  };

  members: {
    userId: number;
    side: string;
  };
}
