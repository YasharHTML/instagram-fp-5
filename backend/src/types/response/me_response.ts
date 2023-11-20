import { ApiProperty } from '@nestjs/swagger';

export class MeResponse {
  @ApiProperty()
  username: string;

  @ApiProperty()
  _id: string;

  @ApiProperty()
  email: string;
}
