import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
  
  @ApiProperty()
  username: string;
}
