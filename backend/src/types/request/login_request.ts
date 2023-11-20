import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({type: Boolean})
  rememberLogin: boolean;
}
