import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Types } from 'mongoose';
import { LoginRequest } from 'src/types/request/login_request';
import { RegisterRequest } from 'src/types/request/register_request';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async me(
    @Session()
    {
      _id,
      username,
      email,
    }: {
      username: string;
      _id: Types.ObjectId;
      email: string;
    },
  ) {
    return {
      email,
      _id,
      username,
    };
  }

  @Post('signin')
  async login(
    @Body()
    { email, password, rememberLogin }: LoginRequest,
    @Session() session: Record<string, any>,
  ) {
    const { _id, username } = await this.authService.login(email, password);
    session._id = _id;
    session.username = username;
    session.email = email;
    if (!rememberLogin) session.cookie.maxAge = 60 * 60 * 1000 * 12;
    return {
      loggedIn: true,
    };
  }

  @Post('signup')
  register(
    @Body()
    { email, password, username }: RegisterRequest,
  ) {
    return this.authService.register(email, password, username);
  }

  @Delete('signout')
  logoff(@Req() request: Request) {
    return new Promise((res, rej) =>
      request.session.destroy((err) => {
        if (err) return rej(err);
        res(undefined);
      }),
    );
  }
}
